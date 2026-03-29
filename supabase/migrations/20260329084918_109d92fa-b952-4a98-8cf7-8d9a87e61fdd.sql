-- Update 卖点分析 template
UPDATE public.prompt_templates SET template_content = '你是美客多（Mercado Libre）资深运营专家。请根据以下产品信息，提取5个核心卖点。每个卖点一行，不带编号，简洁有力。

重要：你必须使用 {{language}} 来撰写所有卖点内容。如果目标市场是巴西，必须使用葡萄牙语；其他拉美市场使用对应地区的西班牙语。只输出卖点内容，不要其他文字。

产品名称: {{product_name}}
产品描述: {{product_description}}
关键词: {{keywords}}
目标市场: {{market}}
输出语言: {{language}}'
WHERE template_name = '卖点分析';

-- Update 标题生成 template
UPDATE public.prompt_templates SET template_content = '你是美客多SEO标题专家。根据产品信息和卖点，生成一个SEO优化的商品标题，最多{{title_limit}}个字符。

重要规则：
1. 标题必须使用 {{language}} 撰写。巴西站用葡萄牙语，其他站点用对应地区西班牙语。
2. 标题中不要包含中文，必须是目标语言。
3. 遵循美客多{{market}}站点的标题规范：品牌+核心产品词+关键属性+差异化卖点。
4. 只输出标题本身，不要引号或其他文字。

产品名称: {{product_name}}
产品描述: {{product_description}}
关键词: {{keywords}}
目标市场: {{market}}

核心卖点:
{{selling_points}}'
WHERE template_name = '标题生成';

-- Update 描述生成 template
UPDATE public.prompt_templates SET template_content = '你是美客多商品描述文案专家。根据产品信息和卖点，撰写300-500字的详细商品描述。

重要规则：
1. 描述必须完全使用 {{language}} 撰写，不要包含中文。
2. 巴西站使用葡萄牙语，其他拉美市场使用对应地区的西班牙语。
3. 内容要有吸引力、包含规格参数、解答买家常见疑虑。
4. 符合美客多{{market}}站点的描述规范，段落清晰。
5. 只输出描述正文，不要标题或其他说明文字。

产品名称: {{product_name}}
产品描述: {{product_description}}
关键词: {{keywords}}
目标市场: {{market}}

核心卖点:
{{selling_points}}
标题: {{title}}'
WHERE template_name = '描述生成';

-- Update 轮播图规划 template
UPDATE public.prompt_templates SET template_content = '你是电商视觉策划专家。请为该商品规划{{image_count}}张轮播图的内容方案。每张图一行描述拍摄角度/展示重点。不带编号，只输出规划内容。

注意：规划内容请使用英文描述（因为图片生成模型需要英文prompt），但要考虑{{market}}市场（{{language}}）消费者的审美偏好。

产品名称: {{product_name}}
产品描述: {{product_description}}
关键词: {{keywords}}
目标市场: {{market}}

核心卖点:
{{selling_points}}'
WHERE template_name = '轮播图规划';

-- Update 主图生成 template
UPDATE public.prompt_templates SET template_content = 'Generate a professional e-commerce main product photo of {{product_name}}. Product details: {{product_description}}. Requirements: Pure white background, professional studio lighting, product centered and prominent, high resolution 4K quality, no text or watermarks. Image aspect ratio: {{image_size_desc}}. Output the image directly.'
WHERE template_name = '主图生成';

-- Update 轮播图生成 template
UPDATE public.prompt_templates SET template_content = 'Generate a professional e-commerce product photo: {{carousel_plan_item}}. Product: {{product_name}}. {{product_description}}. Requirements: Clean white background, professional studio lighting, product centered, high quality, no text or watermarks. Image aspect ratio: {{image_size_desc}}. Output the image directly.'
WHERE template_name = '轮播图生成';