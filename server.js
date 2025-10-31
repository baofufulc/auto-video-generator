import express from "express";
import fs from "fs";
import path from "path";
import googleTTS from "google-tts-api";
import fetch from "node-fetch";
import { exec } from "child_process";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/generate", async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) {
      return res.status(400).json({ error: "❌ 请提供文本内容 text" });
    }

    // 创建工作目录
    const outputDir = "./output";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const timestamp = Date.now();
    const voiceFile = path.join(outputDir, `voice_${timestamp}.mp3`);
    const videoFile = path.join(outputDir, `video_${timestamp}.mp4`);
    const imageFile = path.join(outputDir, `bg_${timestamp}.jpg`);

    console.log("🗣️ 开始生成语音...");

    // 使用 google-tts-api 生成语音
    const url = googleTTS.getAudioUrl(text, {
      lang: "zh",
      slow: false,
    });

    const responseTTS = await fetch(url);
    const audioBuffer = await responseTTS.arrayBuffer();
    fs.writeFileSync(voiceFile, Buffer.from(audioBuffer));

    console.log("✅ 语音生成完成");

    // 使用 Pexels 图片 API 或静态图片背景
    console.log("🖼️ 生成背景图片...");
    const backgroundUrl =
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg";
    const imageRes = await fetch(backgroundUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    fs.writeFileSync(imageFile, Buffer.from(imageBuffer));

    console.log("✅ 背景生成完成");

    // 用 FFmpeg 合成竖屏视频
    console.log("🎬 正在合成视频...");
    const ffmpegCmd = `ffmpeg -loop 1 -i ${imageFile} -i ${voiceFile} -c:v libx264 -c:a aac -b:a 192k -shortest -vf "scale=1080:1920,format=yuv420p" ${videoFile}`;

    await new Promise((resolve, reject) => {
      exec(ffmpegCmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    console.log("✅ 视频生成成功");

    res.json({
      message: "✅ 视频生成成功！",
      video_url: `${req.protocol}://${req.get("host")}/${videoFile}`,
    });
  } catch (err) {
    console.error("❌ 生成失败：", err);
    res.status(500).json({ error: "视频生成失败", details: err.message });
  }
});

// 让生成的视频可以直接访问
app.use("/output", express.static("output"));

app.listen(PORT, () => {
  console.log(`🚀 服务器已启动在端口 ${PORT}`);
});
