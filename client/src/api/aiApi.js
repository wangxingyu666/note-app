import axios from 'axios';

const DEEPSEEK_API_KEY = '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 处理Markdown内容，确保格式正确
const formatMarkdownContent = (content) => {
  // 如果内容被反引号包裹，去除最外层的反引号
  content = content.replace(/^\`\`\`markdown\n([\s\S]*)\`\`\`$/m, '$1');
  content = content.replace(/^\`\`\`\n([\s\S]*)\`\`\`$/m, '$1');

  // 确保标题格式正确
  content = content.replace(/^#\s+/gm, '# ');

  // 确保列表格式正确
  content = content.replace(/^\-\s+/gm, '- ');
  content = content.replace(/^\*\s+/gm, '* ');

  // 去除多余的空行
  content = content.replace(/\n{3,}/g, '\n\n');

  return content.trim();
};

export const generateNoteContent = async (title) => {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的笔记助手，请生成详细的笔记内容。使用Markdown格式，但不要使用代码块格式。按照以下结构输出：\n' +
              '1. 使用一级标题 # 作为主标题\n' +
              '2. 使用二级标题 ## 作为章节标题\n' +
              '3. 使用无序列表 - 或 * 来列举要点\n' +
              '4. 使用 > 来标注重要内容\n' +
              '5. 使用**粗体**标注关键词\n' +
              '6. 使用普通段落描述详细内容\n' +
              '注意：不要使用```代码块```格式，直接输出Markdown文本。',
          },
          {
            role: 'user',
            content: `请为标题"${title}"生成一篇详细的笔记内容，包含概述、主要内容和总结。`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
      },
    );

    const generatedContent = response.data.choices[0].message.content;
    return formatMarkdownContent(generatedContent);
  } catch (error) {
    console.error('生成笔记内容失败:', error);
    throw error;
  }
};
