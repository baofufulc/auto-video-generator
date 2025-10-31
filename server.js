import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 主页测试路由
app.get("/", (req, res) => {
  res.send("✅ 服务器运行成功！AI视频生成服务已启动。");
});

// 监听端口（Railway 自动分配）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
