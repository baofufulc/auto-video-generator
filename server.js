import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 测试主页
app.get("/", (req, res) => {
  res.send("✅ 服务器运行成功！AI 视频生成服务已启动。");
});

// ✅ 生成接口（POST /generate）
app.post("/generate", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "缺少 text 参数" });
    }

    // 示例：调用可灵 AI 或 ElevenLabs 的伪逻辑
    const fakeResult = {
      message: "成功生成视频脚本",
      input: text,
      output: `视频脚本示例：开场白是「${text}」`,
    };

    res.json(fakeResult);
  } catch (error) {
    console.error("❌ 生成错误：", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// ✅ Railway 自动端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
