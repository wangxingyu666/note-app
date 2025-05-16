import pool from "../config/db.js";

//注册用户
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, nickname, avatar_url } = req.body;
    const [result] = await pool.query(
      "INSERT INTO users (username,email,password) VALUES (?,?,?)",
      [username, email, password]
    );
    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//登录用户
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username=? AND password=?",
      [username, password]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//获取所有用户
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//更新用户设置
export const updateUserSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { theme, navbar_position, navbar_visible } = req.body;

    let query = "UPDATE users SET";
    const queryParams = [];

    if (theme !== undefined) {
      query += " theme_id = ?,";
      queryParams.push(theme);
    }

    if (navbar_position !== undefined) {
      query += " navbar_position = ?,";
      queryParams.push(navbar_position);
    }

    if (navbar_visible !== undefined) {
      query += " navbar_visible = ?,";
      queryParams.push(navbar_visible);
    }

    // 移除最后的逗号
    query = query.slice(0, -1);
    query += " WHERE id = ?";
    queryParams.push(id);

    await pool.query(query, queryParams);

    // 获取更新后的用户数据
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//更新用户个人信息
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, password, avatar_url } = req.body;

    let query = "UPDATE users SET";
    const queryParams = [];

    if (nickname) {
      query += " nickname = ?,";
      queryParams.push(nickname);
    }

    if (password) {
      query += " password = ?,";
      queryParams.push(password);
    }

    if (avatar_url) {
      query += " avatar_url = ?,";
      queryParams.push(avatar_url);
    }

    // 移除最后的逗号
    query = query.slice(0, -1);
    query += " WHERE id = ?";
    queryParams.push(id);

    await pool.query(query, queryParams);

    // 获取更新后的用户数据
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
