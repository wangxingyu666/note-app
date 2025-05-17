import pool from "../config/db.js";

// 获取首页笔记列表（按分类）
export const getHomeNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    // 获取所有分类
    const [categories] = await pool.query("SELECT * FROM categories");

    // 获取每个分类下的笔记
    const result = await Promise.all(
      categories.map(async (category) => {
        const [notes] = await pool.query(
          "SELECT * FROM notes WHERE user_id = ? AND category_id = ?",
          [userId, category.id]
        );
        return {
          category: category,
          notes: notes,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 创建笔记
export const createNote = async (req, res) => {
  try {
    const { title, content, tags, userId, categoryId } = req.body;
    if (!title || !content || !userId || !categoryId) {
      return res.status(400).json({ error: "必填字段不能为空" });
    }

    // 确保content是字符串类型
    const sanitizedContent =
      typeof content === "string" ? content : JSON.stringify(content);

    const query = `INSERT INTO notes (title, content, tags, user_id, category_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
    const values = [
      title,
      sanitizedContent,
      JSON.stringify(tags || []),
      userId,
      categoryId,
    ];
    const [result] = await pool.query(query, values);
    res.status(201).json({
      id: result.insertId,
      userId,
      title,
      content: sanitizedContent,
      categoryId,
      tags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取笔记列表
export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { keyword, categoryId, sortOrder } = req.query;

    let baseQuery = "SELECT * FROM notes WHERE user_id = ?";
    const params = [userId];

    if (keyword) {
      baseQuery += " AND (title LIKE ? OR content LIKE ?)";
      const searchTerm = `%${keyword}%`;
      params.push(searchTerm, searchTerm);
    }

    if (categoryId) {
      baseQuery += " AND category_id = ?";
      params.push(categoryId);
    }

    if (sortOrder) {
      baseQuery += ` ORDER BY created_at ${
        sortOrder === "asc" ? "ASC" : "DESC"
      }`;
    }

    const [rows] = await pool.query(baseQuery, params);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 根据分类获取笔记列表
export const getNotesByCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? AND category_id = ?",
      [userId, categoryId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个笔记
export const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
    if (rows.length > 0) {
      const note = rows[0];
      // 确保返回的content是字符串
      note.content =
        typeof note.content === "string"
          ? note.content
          : JSON.stringify(note.content);
      // 解析tags
      note.tags =
        typeof note.tags === "string" ? JSON.parse(note.tags) : note.tags || [];
      res.status(200).json(note);
    } else {
      res.status(404).json({ error: "Note not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 更新笔记
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tags } = req.body;

    // 确保content是字符串类型
    const sanitizedContent =
      typeof content === "string" ? content : JSON.stringify(content);

    await pool.query(
      "UPDATE notes SET title = ?, content = ?, category_id = ?, tags = ? WHERE id = ?",
      [title, sanitizedContent, categoryId, JSON.stringify(tags), id]
    );
    res.status(200).json({
      id,
      title,
      content: sanitizedContent,
      categoryId,
      tags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除笔记
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM notes WHERE id = ?", [id]);
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取各分类的笔记数量统计
export const getCategoryNotesStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT c.id, c.name, COUNT(n.id) as count 
       FROM categories c 
       LEFT JOIN notes n ON c.id = n.category_id AND n.user_id = ? 
       GROUP BY c.id, c.name`,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取最近7天的笔记发布统计
export const getRecentNotesStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM notes 
       WHERE user_id = ? 
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) 
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 导出笔记
export const exportNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { noteId } = req.query; // 可选参数，用于导出单个笔记

    let query = "SELECT * FROM notes WHERE user_id = ?";
    const params = [userId];

    if (noteId) {
      query += " AND id = ?";
      params.push(noteId);
    }

    const [notes] = await pool.query(query, params);

    // 处理每个笔记的tags
    const processedNotes = notes.map((note) => ({
      ...note,
      tags:
        typeof note.tags === "string" ? JSON.parse(note.tags) : note.tags || [],
    }));

    // 设置响应头
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=notes_export_${userId}.json`
    );

    res.status(200).json(processedNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 导入笔记
export const importNotes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "没有上传文件" });
    }

    let notesData;
    try {
      notesData = JSON.parse(req.file.buffer.toString());
    } catch (error) {
      return res
        .status(400)
        .json({ error: "JSON格式无效，请确保文件内容是有效的JSON格式" });
    }

    if (!Array.isArray(notesData)) {
      return res.status(400).json({
        error: "无效的笔记数据格式，数据必须是数组格式",
        expectedFormat: {
          format: "数组",
          example: [
            {
              title: "笔记标题",
              content: "笔记内容",
              category_id: "分类ID（数字）",
              tags: ["标签1", "标签2"],
            },
          ],
        },
      });
    }

    if (notesData.length === 0) {
      return res.status(400).json({ error: "笔记数据为空" });
    }

    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 插入每个笔记
      for (let i = 0; i < notesData.length; i++) {
        const note = notesData[i];
        const { title, content, tags, category_id } = note;

        // 详细的字段验证
        const errors = [];
        if (!title) errors.push("标题不能为空");
        if (!content) errors.push("内容不能为空");
        if (!category_id) errors.push("分类ID不能为空");
        if (typeof category_id !== "number")
          errors.push("分类ID必须是数字类型");
        if (tags && !Array.isArray(tags)) errors.push("标签必须是数组格式");

        if (errors.length > 0) {
          throw new Error(`第 ${i + 1} 条笔记数据无效：${errors.join(", ")}`);
        }

        // 确保content是字符串类型
        const sanitizedContent =
          typeof content === "string" ? content : JSON.stringify(content);

        // 验证分类是否存在
        const [categoryExists] = await connection.query(
          "SELECT id FROM categories WHERE id = ?",
          [category_id]
        );

        if (categoryExists.length === 0) {
          throw new Error(`第 ${i + 1} 条笔记的分类ID ${category_id} 不存在`);
        }

        // 插入笔记
        await connection.query(
          `INSERT INTO notes (title, content, tags, user_id, category_id, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            title,
            sanitizedContent,
            JSON.stringify(tags || []),
            userId,
            category_id,
          ]
        );
      }

      // 提交事务
      await connection.commit();
      res.status(200).json({
        message: `成功导入 ${notesData.length} 条笔记`,
        success: true,
      });
    } catch (error) {
      // 如果出错，回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
      tip: "请确保您的JSON数据格式正确，每条笔记都包含必要的字段（title、content、category_id）",
    });
  }
};
