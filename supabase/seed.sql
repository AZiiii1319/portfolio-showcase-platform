-- Seed data for development and testing
-- Note: This file should be run after the migrations

-- IMPORTANT: This seed file is designed to work with real authenticated users
-- You need to create actual user accounts first, then update the user IDs below

-- Instructions for using this seed data:
-- 1. Register 5 test users through your application's signup process
-- 2. Get their actual user IDs from the auth.users table or profiles table
-- 3. Replace the placeholder UUIDs below with the real user IDs
-- 4. Then run this seed file

-- Example of how to get real user IDs after creating accounts:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- For now, this file contains sample data structure that you can use as a template
-- Replace these UUIDs with real user IDs from your auth.users table

/*
-- Sample profiles (only insert if the user IDs exist in auth.users)
-- Replace these UUIDs with actual user IDs from your registered users
INSERT INTO profiles (id, username, full_name, bio, avatar_url, website) VALUES
  ('REPLACE_WITH_REAL_USER_ID_1', 'alex_chen', 'Alex Chen', '数字艺术家，专注于概念设计和插画创作。热爱用色彩表达情感，创造充满想象力的视觉世界。', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'https://alexchen.art'),
  ('REPLACE_WITH_REAL_USER_ID_2', 'sarah_kim', 'Sarah Kim', 'UI/UX设计师，5年互联网产品设计经验。擅长用户体验设计和界面优化，致力于创造直观易用的数字产品。', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'https://sarahkim.design'),
  ('REPLACE_WITH_REAL_USER_ID_3', 'mike_zhang', 'Mike Zhang', '摄影师和视觉艺术家，专注于城市风光和人文摄影。用镜头记录生活中的美好瞬间。', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'https://mikezhang.photo'),
  ('REPLACE_WITH_REAL_USER_ID_4', 'lisa_wang', 'Lisa Wang', '3D建模师和动画师，热爱创造虚拟世界。专业从事游戏和影视行业的3D内容制作。', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'https://lisawang3d.com'),
  ('REPLACE_WITH_REAL_USER_ID_5', 'david_liu', 'David Liu', '平面设计师，专注于品牌视觉设计和包装设计。相信好的设计能够传达品牌的核心价值。', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'https://davidliu.design');

-- Sample portfolios with high-quality placeholder images
INSERT INTO portfolios (user_id, title, description, category, image_url, tags, is_featured, view_count) VALUES
  ('REPLACE_WITH_REAL_USER_ID_1', '赛博朋克城市', '这是一幅描绘未来城市景观的数字艺术作品。作品融合了霓虹灯光、高楼大厦和科技元素，展现了一个充满想象力的赛博朋克世界。使用了鲜艳的蓝色和紫色调，营造出神秘而充满活力的氛围。', 'digital-art', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop', ARRAY['赛博朋克', '未来', '城市', '霓虹'], true, 245),
  
  ('REPLACE_WITH_REAL_USER_ID_2', '移动银行应用设计', '为新一代移动银行应用设计的用户界面。注重用户体验和安全性，采用简洁的设计语言和直观的交互流程。配色方案使用了信任感强的蓝色系，图标设计简洁明了，确保用户能够轻松完成各种银行操作。', 'ui-ux-design', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop', ARRAY['移动应用', 'UI设计', '银行', '金融'], true, 189),
  
  ('REPLACE_WITH_REAL_USER_ID_3', '城市夜景摄影', '在上海外滩拍摄的城市夜景作品。通过长曝光技术捕捉了车流的光轨和建筑的灯光，展现了现代都市的繁华与活力。构图采用了经典的三分法则，前景、中景、背景层次分明。', 'photography', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop', ARRAY['夜景', '城市', '长曝光', '上海'], false, 156),
  
  ('REPLACE_WITH_REAL_USER_ID_4', '机械战士3D模型', '原创机械战士角色的3D建模作品。模型包含了详细的机械结构和纹理贴图，适用于游戏和动画制作。设计灵感来源于日式机甲动画，融合了现代科技感和传统武士精神。', '3d-modeling', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop', ARRAY['3D建模', '机甲', '角色设计', '游戏'], true, 312),
  
  ('REPLACE_WITH_REAL_USER_ID_5', '咖啡品牌包装设计', '为精品咖啡品牌设计的包装系列。设计理念强调咖啡的手工制作工艺和天然品质，使用了温暖的棕色调和手绘插画元素。包装采用环保材料，体现了品牌对可持续发展的承诺。', 'graphic-design', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop', ARRAY['包装设计', '咖啡', '品牌', '环保'], false, 98),
  
  ('REPLACE_WITH_REAL_USER_ID_1', '抽象数字艺术', '探索色彩与形状关系的抽象数字艺术作品。通过算法生成的几何图形和渐变色彩，创造出富有节奏感的视觉效果。作品表达了数字时代艺术创作的新可能性。', 'digital-art', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop', ARRAY['抽象', '算法艺术', '几何', '色彩'], false, 134),
  
  ('REPLACE_WITH_REAL_USER_ID_2', '电商网站重设计', '对传统电商网站进行的用户体验优化设计。重新设计了商品展示页面、购物流程和支付界面，提升了用户的购物体验。采用了响应式设计，确保在各种设备上都有良好的显示效果。', 'web-design', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', ARRAY['网页设计', '电商', 'UX优化', '响应式'], false, 167),
  
  ('REPLACE_WITH_REAL_USER_ID_3', '人像摄影作品', '在自然光下拍摄的人像摄影作品。通过巧妙的光影运用和构图，展现了被摄者的自然美和内在气质。后期处理保持了照片的真实感，突出了人物的情感表达。', 'photography', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop', ARRAY['人像', '自然光', '情感', '真实'], false, 203);

-- Sample interactions (likes and comments)
-- Note: Replace user IDs with real ones and portfolio IDs will be generated automatically
INSERT INTO interactions (portfolio_id, user_id, type, content) VALUES
  -- Comments for 赛博朋克城市
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_2', 'comment', '太棒了！色彩运用非常出色，很有未来感。'),
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_3', 'comment', '这个作品让我想起了《银翼杀手》的场景，很有电影感。'),
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_4', 'comment', '细节处理得很好，每个建筑都有自己的特色。'),
  
  -- Likes for various portfolios
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_2', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_3', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_4', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市'), 'REPLACE_WITH_REAL_USER_ID_5', 'like', NULL),
  
  -- Comments for 移动银行应用设计
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计'), 'REPLACE_WITH_REAL_USER_ID_1', 'comment', '界面设计很清晰，用户体验考虑得很周到。'),
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计'), 'REPLACE_WITH_REAL_USER_ID_3', 'comment', '配色方案很专业，给人信任感。'),
  
  -- Likes for 移动银行应用设计
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计'), 'REPLACE_WITH_REAL_USER_ID_1', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计'), 'REPLACE_WITH_REAL_USER_ID_3', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计'), 'REPLACE_WITH_REAL_USER_ID_5', 'like', NULL),
  
  -- Comments for 机械战士3D模型
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型'), 'REPLACE_WITH_REAL_USER_ID_2', 'comment', '建模细节太赞了！纹理贴图也很精致。'),
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型'), 'REPLACE_WITH_REAL_USER_ID_5', 'comment', '很有日式机甲的感觉，设计很有创意。'),
  
  -- More likes
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型'), 'REPLACE_WITH_REAL_USER_ID_1', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型'), 'REPLACE_WITH_REAL_USER_ID_2', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型'), 'REPLACE_WITH_REAL_USER_ID_3', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型'), 'REPLACE_WITH_REAL_USER_ID_5', 'like', NULL),
  
  -- Comments for 城市夜景摄影
  ((SELECT id FROM portfolios WHERE title = '城市夜景摄影'), 'REPLACE_WITH_REAL_USER_ID_1', 'comment', '光轨效果拍得很棒，构图也很有层次感。'),
  ((SELECT id FROM portfolios WHERE title = '城市夜景摄影'), 'REPLACE_WITH_REAL_USER_ID_4', 'comment', '长曝光技术运用得很好，城市的活力展现得淋漓尽致。');
*/

-- Create test portfolios for your user
INSERT INTO portfolios (user_id, title, description, category, image_url, tags, is_featured, view_count) VALUES
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '赛博朋克城市', '这是一幅描绘未来城市景观的数字艺术作品。作品融合了霓虹灯光、高楼大厦和科技元素，展现了一个充满想象力的赛博朋克世界。使用了鲜艳的蓝色和紫色调，营造出神秘而充满活力的氛围。创作过程中使用了Photoshop和Blender，花费了大约40小时完成。', 'digital-art', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop', ARRAY['赛博朋克', '未来', '城市', '霓虹', 'Photoshop', 'Blender'], true, 245),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '移动银行应用设计', '为新一代移动银行应用设计的用户界面。注重用户体验和安全性，采用简洁的设计语言和直观的交互流程。配色方案使用了信任感强的蓝色系，图标设计简洁明了，确保用户能够轻松完成各种银行操作。设计过程包括用户调研、原型制作和可用性测试。', 'ui-ux-design', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop', ARRAY['移动应用', 'UI设计', '银行', '金融', 'Figma', '用户体验'], true, 189),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '城市夜景摄影', '在上海外滩拍摄的城市夜景作品。通过长曝光技术捕捉了车流的光轨和建筑的灯光，展现了现代都市的繁华与活力。构图采用了经典的三分法则，前景、中景、背景层次分明。拍摄参数：ISO 100, f/8, 30秒曝光，使用了三脚架和ND滤镜。', 'photography', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop', ARRAY['夜景', '城市', '长曝光', '上海', '外滩', '光轨'], false, 156),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '机械战士3D模型', '原创机械战士角色的3D建模作品。模型包含了详细的机械结构和纹理贴图，适用于游戏和动画制作。设计灵感来源于日式机甲动画，融合了现代科技感和传统武士精神。模型总面数约15万，包含完整的骨骼绑定和动画控制器。', '3d-modeling', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop', ARRAY['3D建模', '机甲', '角色设计', '游戏', 'Maya', 'ZBrush'], true, 312),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '咖啡品牌包装设计', '为精品咖啡品牌设计的包装系列。设计理念强调咖啡的手工制作工艺和天然品质，使用了温暖的棕色调和手绘插画元素。包装采用环保材料，体现了品牌对可持续发展的承诺。整个项目包括logo设计、包装设计和品牌视觉识别系统。', 'graphic-design', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop', ARRAY['包装设计', '咖啡', '品牌', '环保', 'Illustrator', '手绘'], false, 98),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '抽象数字艺术', '探索色彩与形状关系的抽象数字艺术作品。通过算法生成的几何图形和渐变色彩，创造出富有节奏感的视觉效果。作品表达了数字时代艺术创作的新可能性，结合了传统美学原理和现代计算技术。使用Processing和p5.js创作。', 'digital-art', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop', ARRAY['抽象', '算法艺术', '几何', '色彩', 'Processing', '生成艺术'], false, 134),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '电商网站重设计', '对传统电商网站进行的用户体验优化设计。重新设计了商品展示页面、购物流程和支付界面，提升了用户的购物体验。采用了响应式设计，确保在各种设备上都有良好的显示效果。项目包括用户研究、信息架构设计和交互原型制作。', 'web-design', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', ARRAY['网页设计', '电商', 'UX优化', '响应式', 'React', 'Tailwind'], false, 167),
  
  ('939907bc-b2aa-43fe-b11c-aa5abda460b3', '人像摄影作品', '在自然光下拍摄的人像摄影作品。通过巧妙的光影运用和构图，展现了被摄者的自然美和内在气质。后期处理保持了照片的真实感，突出了人物的情感表达。拍摄使用85mm镜头，光圈f/1.8，营造了柔美的背景虚化效果。', 'photography', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop', ARRAY['人像', '自然光', '情感', '真实', '85mm', 'Lightroom'], false, 203);

-- Add some sample interactions (comments and likes) for testing
-- Note: These will use the same user ID for simplicity, but in real usage these would be from different users
INSERT INTO interactions (portfolio_id, user_id, type, content) VALUES
  -- Comments for 赛博朋克城市
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市' AND user_id = '939907bc-b2aa-43fe-b11c-aa5abda460b3'), '939907bc-b2aa-43fe-b11c-aa5abda460b3', 'comment', '这个作品的色彩搭配真的很棒！霓虹灯的效果特别逼真。'),
  
  -- Comments for 移动银行应用设计
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计' AND user_id = '939907bc-b2aa-43fe-b11c-aa5abda460b3'), '939907bc-b2aa-43fe-b11c-aa5abda460b3', 'comment', '界面设计很清晰，用户体验考虑得很周到。特别喜欢这个配色方案。'),
  
  -- Comments for 机械战士3D模型
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型' AND user_id = '939907bc-b2aa-43fe-b11c-aa5abda460b3'), '939907bc-b2aa-43fe-b11c-aa5abda460b3', 'comment', '建模细节太赞了！15万面数的模型一定花了很多时间制作。'),
  
  -- Add some likes
  ((SELECT id FROM portfolios WHERE title = '赛博朋克城市' AND user_id = '939907bc-b2aa-43fe-b11c-aa5abda460b3'), '939907bc-b2aa-43fe-b11c-aa5abda460b3', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '移动银行应用设计' AND user_id = '939907bc-b2aa-43fe-b11c-aa5abda460b3'), '939907bc-b2aa-43fe-b11c-aa5abda460b3', 'like', NULL),
  ((SELECT id FROM portfolios WHERE title = '机械战士3D模型' AND user_id = '939907bc-b2aa-43fe-b11c-aa5abda460b3'), '939907bc-b2aa-43fe-b11c-aa5abda460b3', 'like', NULL);