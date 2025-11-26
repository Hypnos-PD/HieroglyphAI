import { GoogleGenAI } from "@google/genai";
import { FilterSettings, Variant, SearchResult } from "../types";

// Helper to sanitize JSON string if Gemini adds markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateAssociation = async (
  char: string,
  variant: Variant,
  filters: FilterSettings,
  runtimeApiKey?: string
): Promise<Partial<SearchResult>> => {
  // Priority: explicit runtimeApiKey -> localStorage -> build-time env
  let apiKey = runtimeApiKey;
  try {
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = window.localStorage.getItem('hieroglyph_api_key') || undefined;
    }
  } catch (e) {
    // ignore localStorage failures
  }
  apiKey = apiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Provide it via runtime input or set GEMINI_API_KEY at build time.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. 系统指令：设定为精通中文文化与亚文化的视觉导演
  const systemInstruction = `
    你是一位极具想象力的视觉导演和文化研究员。你的任务是根据用户输入的汉字，进行深度的联想，并找到最具视觉冲击力或文化趣味性的图片。
    
    【核心原则：拒绝平庸】
    1. **禁止直译**：不要只看字面意思。例如输入“火”，不要只给我一张火焰的图，除非是在“自然”变体下。
    2. **鼓励发散 (Lateral Thinking)**：
       - **谐音梗**：如“芬” -> “分” -> “天下三分” -> 三国题材。
       - **文化隐喻**：如“德” -> “Deutschland(德国)” -> 德国系角色（如明日香）。
       - **字形联想**：如“囚” -> 人被关在框里 -> 监狱/束缚。
    3. **特定实体优先**：在“动漫”、“游戏”、“影视”变体下，必须关联到**具体的角色名**、**特定的道具**或**经典场景**，绝不要返回通用的风格图。
    
    【搜索策略】
    - 你的目标是找到一张具体的图片。
    - 如果找不到直链（.jpg/.png），找到包含该图片的**具体网页（Source Page）**也是极好的。
    - 优先搜索：Wiki (萌娘百科, Fandom), 官方介绍页, 知名图库 (Pixiv, ArtStation 介绍页)。
  `;

  // 2. 结构化思维 Prompt
  const prompt = `
    请对汉字 "${char}" 进行视觉联想分析。
    
    【当前上下文】
    - 变体领域: "${variant.name}" (关键词: ${variant.keywords.join(', ')})
    - 风格要求: "${filters.style}"
    - 主体类型: "${filters.subject}"
    - 排除内容: "${filters.excludeContent}"

    【思考步骤】
    1. **头脑风暴**：请思考该字在当前领域的 3 种可能性：
       - A. 字义引申 (Literal Meaning)
       - B. 谐音/形近/拆字 (Phonetic/Shape)
       - C. 文化/角色/特定梗 (Cultural/Character) -> **在动漫/游戏领域优先选这个**
    2. **选择最佳方案**：从上述 3 种中选出最有趣、最符合“变体”设定的一个。
       - 例子：输入"德"，变体"动漫"。联想：德 -> 德国 -> 明日香(EVA)。视觉主体："惣流·明日香·兰格雷"。
    3. **生成搜索词**：构造精准的搜索词来寻找图片。
    
    请返回严格的 JSON 格式：
    {
      "associationLogic": "简述你的联想逻辑（如：'芬'谐音'分'，联想到三国分天下的吕布）",
      "visualSubject": "画面的具体主体描述 (中文)",
      "searchQuery": "用于Google搜索的关键词 (尽量用英文+具体作品名/角色名，以获得更好结果)",
      "explanation": "给用户的解释文案 (中文, 60字以内, 解释为什么是这张图)",
      "sourcePageUrl": "尽量找到包含该图片的来源网页链接 (如维基条目、官网介绍)",
      "imageUrl": "尽量找到图片的直接链接 (.jpg/.png)，如果找不到确定的直链，留空即可"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI 未返回内容");

    let data;
    try {
      data = JSON.parse(cleanJson(text));
    } catch (e) {
      console.warn("JSON 解析失败:", text);
      throw new Error("AI 返回格式错误");
    }
    
    // 3. URL 验证逻辑
    let finalImageUrl = '';
    
    // 尝试提取 Image URL
    if (data.imageUrl && typeof data.imageUrl === 'string') {
        const url = data.imageUrl.toLowerCase();
        // 简单的黑名单过滤
        const isSearchPage = url.includes('google.com') || url.includes('bing.com') || url.includes('baidu.com');
        // 允许 html 结尾的链接通过，交给前端 onError 处理（因为很多时候 AI 认为那是图片）
        // 但这里我们尽量只放行看起来像图片的
        if (!isSearchPage) {
             finalImageUrl = data.imageUrl;
        }
    }

    // 如果 AI 没找到 direct image url，但是找到了 sourcePageUrl (比如维基百科条目)，
    // 我们就不强求 imageUrl，前端会显示"跳转来源"
    
    const fallbackQ = data.searchQuery || `${char} ${variant.name} illustration`;

    return {
      explanation: `${data.explanation} (思路: ${data.associationLogic || '自由联想'})`,
      fallbackQuery: fallbackQ,
      imageUrl: finalImageUrl,
      sourceTitle: data.visualSubject || '来源页面',
      sourceUrl: data.sourcePageUrl || `https://www.google.com/search?q=${encodeURIComponent(fallbackQ)}`,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};