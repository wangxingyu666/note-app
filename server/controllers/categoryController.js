import pool from "../config/db.js";

//创建分类;
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // 验证分类名称是否为空
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "分类名称不能为空" });
    }

    // 检查分类名称是否已存在
    const [existing] = await pool.query(
      "SELECT * FROM categories WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "该分类名称已存在" });
    }

    // 创建新分类
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name.trim()]
    );

    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    console.error("创建分类失败:", error);
    res.status(500).json({ error: "服务器内部错误，创建分类失败" });
  }
};

//获取分类列表
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个分类
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//更新分类
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
    res.status(200).json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//删除分类
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
