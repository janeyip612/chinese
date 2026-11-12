// Mandarin II learning map — content data.
// Sources: Notion "Word list - Mandarin Exploration" (last year), Study Guides 1–2 (2025),
// Notion "Word list - Mandarin II Unit 1", Weeks 6–12 lesson plans (Notion, authoritative over Quizlet files).
// Word format: "汉字|pinyin|English". Frame tokens: "汉字|pinyin" fixed, or {s:[...], link:i} slot.
// A slot with link:i always takes the same option index as slot i.

const CURRENT_WEEK = 14;

// Teacher-set focus for this week's Daily review (update every Friday).
// Week 14: shopping (new station d4), plus last week's opinions and last year's clothes.
const FOCUS = {
  week: 14,
  why: "Go shopping in Chinese: ask the price, choose the size and colour, bargain, and decide.",
  stations: ["d4", "d3", "y8"],
};

const ZONES = [
  { id: "y", name: "Last year", zh: "去年的基础", color: "--line-y" },
  { id: "u1", name: "Unit 1 · People", zh: "人物", color: "--line-u1" },
  { id: "c2", name: "School life & feelings", zh: "校园生活与情绪", color: "--line-c2" },
  { id: "c3", name: "Community & places", zh: "社区", color: "--line-c3" },
];

const STATIONS = [
  // ───────── Last year ─────────
  {
    id: "y1", zone: "y", week: 0, title: "时间与日期", en: "Time & dates", when: "Last year · L1–3",
    words: [
      "你好|nǐ hǎo|hello", "再见|zàijiàn|goodbye", "谢谢|xièxie|thank you", "对不起|duìbuqǐ|sorry",
      "没关系|méi guānxi|it doesn't matter", "不客气|bú kèqi|you're welcome", "请|qǐng|please; to invite",
      "零|líng|zero", "百|bǎi|hundred", "千|qiān|thousand", "万|wàn|ten thousand", "两|liǎng|two (before a measure word)",
      "几|jǐ|how many; which (number)", "年|nián|year", "月|yuè|month", "号|hào|date; number", "星期|xīngqī|week; day of the week",
      "今天|jīntiān|today", "昨天|zuótiān|yesterday", "明天|míngtiān|tomorrow", "生日|shēngrì|birthday",
      "早上|zǎoshang|early morning", "上午|shàngwǔ|morning (before noon)", "中午|zhōngwǔ|noon", "下午|xiàwǔ|afternoon",
      "晚上|wǎnshang|evening", "现在|xiànzài|now", "点|diǎn|o'clock", "分|fēn|minute", "半|bàn|half", "一刻|yí kè|a quarter (15 minutes)",
    ],
    frames: [
      { q: "现在几点？|Xiànzài jǐ diǎn?|What time is it now?",
        t: ["现在|xiànzài", { s: ["三点|sān diǎn", "八点半|bā diǎn bàn", "两点一刻|liǎng diǎn yí kè", "十点零五分|shí diǎn líng wǔ fēn"] }, "。|."],
        ex: "现在两点半。|Xiànzài liǎng diǎn bàn.|It's half past two." },
      { q: "今天几月几号？|Jīntiān jǐ yuè jǐ hào?|What's the date today?",
        t: ["今天|jīntiān", { s: ["十一|shíyī", "十二|shí'èr", "一|yī"] }, "月|yuè", { s: ["五|wǔ", "二十|èrshí", "三十|sānshí"] }, "号|hào", "，|,", "星期|xīngqī", { s: ["一|yī", "三|sān", "六|liù"] }, "。|."],
        ex: "今天十一月二号，星期一。|Jīntiān shíyī yuè èr hào, xīngqīyī.|Today is Monday, 2 November." },
    ],
    fill: [
      { q: "两点___（2:15）", o: ["一刻", "半", "分", "点"], a: 0, en: "quarter past two" },
      { q: "现在___点？", o: ["几", "什么", "哪", "谁"], a: 0, en: "What time is it now?" },
    ],
    tip: "Big to small: 年 → 月 → 号 → 星期 → 点 → 分. Like Vietnamese and Korean, the hour comes before the minutes.",
  },
  {
    id: "y2", zone: "y", week: 0, title: "我和我的家", en: "Me & my family", when: "Last year · L4–5",
    words: [
      "我|wǒ|I; me", "你|nǐ|you", "他|tā|he; him", "她|tā|she; her", "我们|wǒmen|we; us", "你们|nǐmen|you (plural)", "他们|tāmen|they; them",
      "名字|míngzi|name", "叫|jiào|to be called", "岁|suì|years old", "年级|niánjí|grade (school year)",
      "小学生|xiǎoxuéshēng|primary school student", "中学生|zhōngxuéshēng|secondary school student", "大学生|dàxuéshēng|university student",
      "家|jiā|home; family", "家人|jiārén|family members", "口|kǒu|(measure word for family members)",
      "爸爸|bàba|dad", "妈妈|māma|mum", "哥哥|gēge|older brother", "姐姐|jiějie|older sister", "弟弟|dìdi|younger brother", "妹妹|mèimei|younger sister",
      "爷爷|yéye|grandpa (dad's dad)", "奶奶|nǎinai|grandma (dad's mum)", "外公|wàigōng|grandpa (mum's dad)", "外婆|wàipó|grandma (mum's mum)",
      "朋友|péngyou|friend", "同学|tóngxué|classmate", "谁|shéi|who", "什么|shénme|what", "吗|ma|(question word at the end)",
      "和|hé|and", "也|yě|also; too", "不|bù|not; no", "有|yǒu|to have; there is", "没有|méiyǒu|not have; there isn't",
      "这|zhè|this", "那|nà|that",
    ],
    frames: [
      { q: "你叫什么名字？|Nǐ jiào shénme míngzi?|What's your name?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, "叫|jiào", { s: ["安安|Ān'an", "小美|Xiǎoměi", "大明|Dàmíng"] }, "，|,", "今年|jīnnián", { s: ["十四|shísì", "十五|shíwǔ", "十六|shíliù"] }, "岁|suì", "。|."],
        ex: "我叫小美，今年十五岁。|Wǒ jiào Xiǎoměi, jīnnián shíwǔ suì.|My name is Xiaomei. I'm 15." },
      { q: "你家有几口人？|Nǐ jiā yǒu jǐ kǒu rén?|How many people are in your family?",
        t: [{ s: ["我家|wǒ jiā", "他家|tā jiā", "她家|tā jiā"] }, "有|yǒu", { s: ["三|sān", "四|sì", "五|wǔ"] }, "口人|kǒu rén", "。|."],
        ex: "我家有四口人。|Wǒ jiā yǒu sì kǒu rén.|There are four people in my family." },
      { q: "你有哥哥吗？|Nǐ yǒu gēge ma?|Do you have an older brother?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, { s: ["有一个哥哥|yǒu yí ge gēge", "有两个妹妹|yǒu liǎng ge mèimei", "没有弟弟|méiyǒu dìdi"] }, "。|."],
        ex: "我没有弟弟。|Wǒ méiyǒu dìdi.|I don't have a younger brother." },
    ],
    fill: [
      { q: "我家___四口人。", o: ["有", "是", "在", "叫"], a: 0, en: "There are four people in my family." },
      { q: "你叫___名字？", o: ["什么", "谁", "几", "吗"], a: 0, en: "What's your name?" },
    ],
  },
  {
    id: "y3", zone: "y", week: 0, title: "长什么样？", en: "What do they look like?", when: "Last year · L6",
    words: [
      "眼睛|yǎnjing|eye", "鼻子|bízi|nose", "嘴巴|zuǐba|mouth", "耳朵|ěrduo|ear", "脸|liǎn|face", "头|tóu|head", "头发|tóufa|hair",
      "手|shǒu|hand", "脚|jiǎo|foot", "大|dà|big", "小|xiǎo|small", "长|cháng|long", "短|duǎn|short (length)",
      "高|gāo|tall", "矮|ǎi|short (height)", "胖|pàng|chubby", "瘦|shòu|thin", "很|hěn|very",
    ],
    frames: [
      { q: "他长什么样？|Tā zhǎng shénme yàng?|What does he look like?",
        t: [{ s: ["他|tā", "她|tā", "我妹妹|wǒ mèimei"] }, "有|yǒu", { s: ["大|dà", "小|xiǎo"] }, { s: ["眼睛|yǎnjing", "耳朵|ěrduo", "嘴巴|zuǐba"] }, "。|."],
        ex: "她有大眼睛。|Tā yǒu dà yǎnjing.|She has big eyes." },
      { q: "他的头发长吗？|Tā de tóufa cháng ma?|Is his hair long?",
        t: [{ s: ["他|tā", "她|tā", "我哥哥|wǒ gēge"] }, "的|de", "头发|tóufa", "很|hěn", { s: ["长|cháng", "短|duǎn"] }, "。|."],
        ex: "我哥哥的头发很短。|Wǒ gēge de tóufa hěn duǎn.|My older brother's hair is short." },
      { q: "他高吗？|Tā gāo ma?|Is he tall?",
        t: [{ s: ["他|tā", "她|tā", "我爸爸|wǒ bàba"] }, "不|bù", { s: ["高|gāo", "胖|pàng"] }, "也不|yě bù", { s: ["矮|ǎi", "瘦|shòu"], link: 1 }, "。|."],
        ex: "他不胖也不瘦。|Tā bú pàng yě bú shòu.|He's neither chubby nor thin." },
    ],
    fill: [
      { q: "她___什么样？", o: ["长", "是", "有", "叫"], a: 0, en: "What does she look like?" },
    ],
  },
  {
    id: "y4", zone: "y", week: 0, title: "国家与语言", en: "Countries & languages", when: "Last year · L7–8",
    words: [
      "中国|Zhōngguó|China", "越南|Yuènán|Vietnam", "美国|Měiguó|USA", "英国|Yīngguó|UK", "韩国|Hánguó|Korea", "日本|Rìběn|Japan",
      "人|rén|person", "哪|nǎ|which", "哪儿|nǎr|where", "住|zhù|to live", "在|zài|at; in", "出生|chūshēng|to be born", "长大|zhǎngdà|to grow up",
      "会|huì|can; know how to", "说|shuō|to speak; to say", "汉语|Hànyǔ|Chinese (language)", "英语|Yīngyǔ|English (language)",
      "韩语|Hányǔ|Korean (language)", "越南语|Yuènányǔ|Vietnamese (language)", "日语|Rìyǔ|Japanese (language)",
      "语言|yǔyán|language", "外语|wàiyǔ|foreign language", "一点儿|yìdiǎnr|a little",
    ],
    frames: [
      { q: "你是哪国人？|Nǐ shì nǎ guó rén?|Where are you from?",
        t: [{ s: ["我|wǒ", "他|tā", "我朋友|wǒ péngyou"] }, "是|shì", { s: ["越南|Yuènán", "韩国|Hánguó", "日本|Rìběn", "美国|Měiguó"] }, "人|rén", "。|."],
        ex: "我是韩国人。|Wǒ shì Hánguó rén.|I'm Korean." },
      { q: "你在哪儿出生？|Nǐ zài nǎr chūshēng?|Where were you born?",
        t: [{ s: ["我|wǒ", "她|tā", "我妈妈|wǒ māma"] }, "在|zài", { s: ["越南|Yuènán", "韩国|Hánguó", "中国|Zhōngguó"] }, { s: ["出生|chūshēng", "长大|zhǎngdà"] }, "。|."],
        ex: "她在越南长大。|Tā zài Yuènán zhǎngdà.|She grew up in Vietnam." },
      { q: "你会说什么语言？|Nǐ huì shuō shénme yǔyán?|What languages can you speak?",
        t: [{ s: ["我|wǒ", "我妈妈|wǒ māma", "他们|tāmen"] }, "会说|huì shuō", { s: ["一点儿汉语|yìdiǎnr Hànyǔ", "英语和韩语|Yīngyǔ hé Hányǔ", "越南语|Yuènányǔ"] }, "。|."],
        ex: "我会说一点儿汉语。|Wǒ huì shuō yìdiǎnr Hànyǔ.|I can speak a little Chinese." },
    ],
    fill: [
      { q: "你是___国人？", o: ["哪", "什么", "几", "谁"], a: 0, en: "Which country are you from?" },
      { q: "我___说一点儿汉语。", o: ["会", "是", "在", "有"], a: 0, en: "I can speak a little Chinese." },
      { q: "你住___哪儿？", o: ["在", "是", "有", "去"], a: 0, en: "Where do you live?" },
    ],
  },
  {
    id: "y5", zone: "y", week: 0, title: "工作与学校", en: "Work & school", when: "Last year · L9",
    words: [
      "工作|gōngzuò|job; to work", "上班|shàngbān|to go to work", "下班|xiàbān|to finish work", "上学|shàngxué|to go to school",
      "出差|chūchāi|to go on a business trip", "忙|máng|busy", "老师|lǎoshī|teacher", "医生|yīshēng|doctor", "律师|lǜshī|lawyer",
      "学校|xuéxiào|school", "医院|yīyuàn|hospital", "做|zuò|to do; to make", "时间|shíjiān|time",
    ],
    frames: [
      { q: "你爸爸做什么工作？|Nǐ bàba zuò shénme gōngzuò?|What does your dad do?",
        t: [{ s: ["我爸爸|wǒ bàba", "我妈妈|wǒ māma", "他|tā"] }, "是|shì", { s: ["医生|yīshēng", "老师|lǎoshī", "律师|lǜshī"] }, "。|."],
        ex: "我妈妈是医生。|Wǒ māma shì yīshēng.|My mum is a doctor." },
      { q: "A 不 A？|A bù A?|Yes-or-no question",
        t: [{ s: ["你|nǐ", "你妈妈|nǐ māma", "你哥哥|nǐ gēge"] }, { s: ["忙不忙|máng bu máng", "是不是老师|shì bu shì lǎoshī", "会不会说英语|huì bu huì shuō Yīngyǔ"] }, "？|?"],
        ex: "你妈妈忙不忙？|Nǐ māma máng bu máng?|Is your mum busy?" },
    ],
    fill: [
      { q: "我妈妈在医院___。", o: ["上班", "上学", "出生", "是"], a: 0, en: "My mum works at a hospital." },
      { q: "你做___工作？", o: ["什么", "谁", "哪儿", "几"], a: 0, en: "What job do you do?" },
    ],
  },
  {
    id: "y6", zone: "y", week: 0, title: "交通与电话", en: "Transport & phone numbers", when: "Last year · L10",
    words: [
      "怎么|zěnme|how", "去|qù|to go", "坐|zuò|to sit; to take (a bus, train…)", "骑|qí|to ride", "开|kāi|to drive; to open",
      "车|chē|vehicle; car", "校车|xiàochē|school bus", "公共汽车|gōnggòng qìchē|bus", "出租车|chūzūchē|taxi", "火车|huǒchē|train",
      "飞机|fēijī|plane", "船|chuán|boat", "地铁|dìtiě|subway; metro", "自行车|zìxíngchē|bicycle", "走路|zǒulù|to walk",
      "快|kuài|fast", "慢|màn|slow", "贵|guì|expensive", "便宜|piányi|cheap", "因为|yīnwèi|because", "所以|suǒyǐ|so; therefore",
      "路|lù|road", "楼|lóu|building; floor", "电话|diànhuà|telephone", "手机|shǒujī|mobile phone", "号码|hàomǎ|number", "多少|duōshao|how many; how much",
    ],
    frames: [
      { q: "你怎么去学校？|Nǐ zěnme qù xuéxiào?|How do you get to school?",
        t: [{ s: ["我|wǒ", "我哥哥|wǒ gēge", "他们|tāmen"] }, { s: ["坐校车|zuò xiàochē", "坐地铁|zuò dìtiě", "骑自行车|qí zìxíngchē", "走路|zǒulù"] }, "去学校|qù xuéxiào", "。|."],
        ex: "我骑自行车去学校。|Wǒ qí zìxíngchē qù xuéxiào.|I ride a bike to school." },
      { q: "为什么？|Wèishénme?|Why?",
        t: ["因为|yīnwèi", { s: ["出租车很贵|chūzūchē hěn guì", "地铁很快|dìtiě hěn kuài", "我家很近|wǒ jiā hěn jìn"] }, "，|,", "所以|suǒyǐ", "我|wǒ", { s: ["坐公共汽车|zuò gōnggòng qìchē", "坐地铁|zuò dìtiě", "走路去|zǒulù qù"], link: 0 }, "。|."],
        ex: "因为地铁很快，所以我坐地铁。|Yīnwèi dìtiě hěn kuài, suǒyǐ wǒ zuò dìtiě.|The metro is fast, so I take the metro." },
    ],
    fill: [
      { q: "你___去学校？——我坐校车。", o: ["怎么", "什么", "哪", "几"], a: 0, en: "How do you get to school? — By school bus." },
      { q: "你的手机号码是___？", o: ["多少", "几岁", "什么人", "哪儿"], a: 0, en: "What's your phone number?" },
    ],
  },
  {
    id: "y7", zone: "y", week: 0, title: "我的一天", en: "My day", when: "Last year · L13",
    words: [
      "进|jìn|to come in", "喝|hē|to drink", "茶|chá|tea", "水|shuǐ|water", "果汁|guǒzhī|juice",
      "起床|qǐchuáng|to get up", "睡觉|shuìjiào|to sleep", "刷牙|shuāyá|to brush teeth", "洗澡|xǐzǎo|to shower; to bathe",
      "吃饭|chīfàn|to eat a meal", "放学|fàngxué|to finish school", "做作业|zuò zuòyè|to do homework", "玩游戏|wán yóuxì|to play games",
      "看书|kànshū|to read", "每天|měitiān|every day",
    ],
    frames: [
      { q: "你每天几点起床？|Nǐ měitiān jǐ diǎn qǐchuáng?|What time do you get up every day?",
        t: [{ s: ["我|wǒ", "我弟弟|wǒ dìdi", "她|tā"] }, "每天|měitiān", { s: ["早上六点|zǎoshang liù diǎn", "下午三点|xiàwǔ sān diǎn", "晚上十点|wǎnshang shí diǎn"] }, { s: ["起床|qǐchuáng", "放学|fàngxué", "睡觉|shuìjiào"], link: 1 }, "。|."],
        ex: "我每天晚上十点睡觉。|Wǒ měitiān wǎnshang shí diǎn shuìjiào.|I go to bed at 10 every night." },
      { q: "有朋友来你家。|Yǒu péngyou lái nǐ jiā.|A friend comes to your home.",
        t: ["请进|qǐng jìn", "！|!", "请喝|qǐng hē", { s: ["茶|chá", "水|shuǐ", "果汁|guǒzhī"] }, "。|."],
        ex: "请进！请喝茶。|Qǐng jìn! Qǐng hē chá.|Come in! Have some tea." },
    ],
    fill: [
      { q: "我每天晚上十点___。", o: ["睡觉", "起床", "放学", "上学"], a: 0, en: "I go to bed at ten every night." },
    ],
  },
  {
    id: "y8", zone: "y", week: 0, title: "穿衣与爱好", en: "Clothes & hobbies", when: "Last year",
    words: [
      "衣服|yīfu|clothes", "穿|chuān|to wear", "非常|fēicháng|extremely", "红|hóng|red", "白|bái|white", "黑|hēi|black",
      "蓝|lán|blue", "黄|huáng|yellow", "粉|fěn|pink", "衬衫|chènshān|shirt", "裙子|qúnzi|skirt", "裤子|kùzi|trousers", "鞋子|xiézi|shoes",
      "酷|kù|cool", "可爱|kě'ài|cute", "好看|hǎokàn|good-looking; nice", "喜欢|xǐhuan|to like", "看|kàn|to look; to watch; to read",
      "书|shū|book", "电视|diànshì|TV", "电影|diànyǐng|film; movie", "听|tīng|to listen", "跑步|pǎobù|to run",
      "游泳|yóuyǒng|to swim", "打篮球|dǎ lánqiú|to play basketball", "踢足球|tī zúqiú|to play football", "听音乐|tīng yīnyuè|to listen to music",
    ],
    frames: [
      { q: "她穿什么？|Tā chuān shénme?|What is she wearing?",
        t: [{ s: ["她|tā", "我姐姐|wǒ jiějie", "他|tā"] }, "穿|chuān", { s: ["红|hóng", "白|bái", "黑|hēi", "蓝|lán"] }, { s: ["衬衫|chènshān", "裤子|kùzi", "鞋子|xiézi"] }, "。|."],
        ex: "她穿白衬衫。|Tā chuān bái chènshān.|She's wearing a white shirt." },
      { q: "你喜欢什么？|Nǐ xǐhuan shénme?|What do you like?",
        t: [{ s: ["我|wǒ", "我哥哥|wǒ gēge", "我朋友|wǒ péngyou"] }, "喜欢|xǐhuan", { s: ["跑步|pǎobù", "游泳|yóuyǒng", "打篮球|dǎ lánqiú", "看电影|kàn diànyǐng"] }, "，|,", "不喜欢|bù xǐhuan", { s: ["踢足球|tī zúqiú", "看电视|kàn diànshì", "听音乐|tīng yīnyuè"] }, "。|."],
        ex: "我喜欢游泳，不喜欢踢足球。|Wǒ xǐhuan yóuyǒng, bù xǐhuan tī zúqiú.|I like swimming but not football." },
    ],
    fill: [
      { q: "她___白衬衫。", o: ["穿", "看", "喝", "坐"], a: 0, en: "She's wearing a white shirt." },
      { q: "你的鞋子___好看！", o: ["非常", "也不", "比", "都"], a: 0, en: "Your shoes are really nice!" },
    ],
  },

  // ───────── Unit 1 · People (Weeks 2–4) ─────────
  {
    id: "u1", zone: "u1", week: 2, title: "外貌与比较", en: "Looks & comparing", when: "Week 2",
    words: [
      "聪明|cōngmíng|smart", "友好|yǒuhǎo|friendly", "漂亮|piàoliang|pretty", "帅|shuài|handsome",
      "比|bǐ|than; to compare", "长发|cháng fà|long hair", "短发|duǎn fà|short hair", "个子|gèzi|height; build",
    ],
    review: ["高", "矮", "胖", "瘦"],
    frames: [
      { q: "谁高？|Shéi gāo?|Who is taller?",
        t: [{ s: ["我|wǒ", "我哥哥|wǒ gēge", "他|tā"] }, "比|bǐ", { s: ["你|nǐ", "我姐姐|wǒ jiějie", "她|tā"] }, { s: ["高|gāo", "矮|ǎi", "瘦|shòu", "聪明|cōngmíng"] }, "。|."],
        ex: "我哥哥比我高。|Wǒ gēge bǐ wǒ gāo.|My older brother is taller than me." },
    ],
    errors: [
      { ok: "我比你高。", bad: ["我比你很高。"], tip: "No 很 after 比." },
    ],
    fill: [
      { q: "哥哥___我高。", o: ["比", "很", "又", "也"], a: 0, en: "My older brother is taller than me." },
    ],
  },
  {
    id: "u2", zone: "u1", week: 3, title: "性格（一）", en: "Personality 1", when: "Week 3",
    words: ["热情|rèqíng|warm; enthusiastic", "害羞|hàixiū|shy", "努力|nǔlì|hard-working", "懒|lǎn|lazy", "诚实|chéngshí|honest", "幽默|yōumò|humorous"],
    frames: [
      { q: "虽然……但是……|suīrán… dànshì…|although … (still) …",
        t: [{ s: ["他|tā", "她|tā", "我朋友|wǒ péngyou"] }, "虽然|suīrán", { s: ["很害羞|hěn hàixiū", "有一点儿懒|yǒu yìdiǎnr lǎn", "不高|bù gāo"] }, "，|,", "但是|dànshì", { s: ["很聪明|hěn cōngmíng", "很幽默|hěn yōumò", "很努力|hěn nǔlì"] }, "。|."],
        ex: "他虽然很害羞，但是很幽默。|Tā suīrán hěn hàixiū, dànshì hěn yōumò.|He's shy, but he's funny." },
    ],
    errors: [
      { ok: "她虽然不高，但是很努力。", bad: ["她虽然不高，所以很努力。"], tip: "虽然 goes with 但是. 因为 goes with 所以." },
    ],
    fill: [
      { q: "他虽然很害羞，___很幽默。", o: ["但是", "所以", "因为", "也"], a: 0, en: "He's shy, but he's funny." },
    ],
  },
  {
    id: "u3", zone: "u1", week: 4, title: "性格（二）", en: "Personality 2", when: "Week 4",
    words: ["随和|suíhe|easy-going", "细心|xìxīn|careful", "开朗|kāilǎng|cheerful; outgoing", "善良|shànliáng|kind-hearted", "活泼|huópō|lively", "固执|gùzhí|stubborn"],
    frames: [
      { q: "又……又……|yòu… yòu…|both … and …",
        t: [{ s: ["她|tā", "我妹妹|wǒ mèimei", "他|tā"] }, "又|yòu", { s: ["聪明|cōngmíng", "活泼|huópō", "高|gāo"] }, "又|yòu", { s: ["细心|xìxīn", "善良|shànliáng", "帅|shuài"] }, "。|."],
        ex: "她又聪明又细心。|Tā yòu cōngmíng yòu xìxīn.|She's smart and careful." },
      { q: "不……也不……|bù… yě bù…|neither … nor …",
        t: [{ s: ["他|tā", "我哥哥|wǒ gēge"] }, "不|bù", { s: ["懒|lǎn", "胖|pàng"] }, "也不|yě bù", { s: ["固执|gùzhí", "矮|ǎi"], link: 1 }, "。|."],
        ex: "他不懒也不固执。|Tā bù lǎn yě bú gùzhí.|He's neither lazy nor stubborn." },
      { q: "看起来……其实……|kàn qǐlai… qíshí…|looks … but actually …",
        t: [{ s: ["他|tā", "她|tā", "我同学|wǒ tóngxué"] }, "看起来|kàn qǐlai", { s: ["很害羞|hěn hàixiū", "很酷|hěn kù", "不友好|bù yǒuhǎo"] }, "，|,", "其实|qíshí", { s: ["很开朗|hěn kāilǎng", "很可爱|hěn kě'ài", "很热情|hěn rèqíng"] }, "。|."],
        ex: "他看起来很害羞，其实很开朗。|Tā kàn qǐlai hěn hàixiū, qíshí hěn kāilǎng.|He looks shy, but he's actually outgoing." },
    ],
    errors: [
      { ok: "他又高又聪明。", bad: ["他又很高又很聪明。"], tip: "No 很 inside 又……又……." },
    ],
    fill: [
      { q: "她___聪明又细心。", o: ["又", "也", "很", "比"], a: 0, en: "She's smart and careful." },
    ],
  },

  // ───────── C2 · School life & feelings (Weeks 6–10) ─────────
  {
    id: "c1", zone: "c2", week: 6, title: "学校科目", en: "School subjects", when: "Week 6",
    words: [
      "数学|shùxué|maths", "科学|kēxué|science", "历史|lìshǐ|history", "体育|tǐyù|PE", "作业|zuòyè|homework",
      "考试|kǎoshì|exam; test", "成绩|chéngjì|grade; score", "课|kè|class; lesson", "都|dōu|all; both", "一起|yìqǐ|together",
    ],
    review: ["老师", "同学", "也"],
    frames: [
      { q: "也|yě|also",
        t: [{ s: ["我|wǒ", "我朋友|wǒ péngyou"] }, "喜欢|xǐhuan", { s: ["数学课|shùxué kè", "历史课|lìshǐ kè", "体育课|tǐyù kè"] }, "，|,", { s: ["他|tā", "我同学|wǒ tóngxué"] }, "也喜欢|yě xǐhuan", "。|."],
        ex: "我喜欢历史课，他也喜欢。|Wǒ xǐhuan lìshǐ kè, tā yě xǐhuan.|I like history, and so does he." },
      { q: "都 / 一起|dōu / yìqǐ|all / together",
        t: [{ s: ["我们|wǒmen", "我和我朋友|wǒ hé wǒ péngyou"] }, { s: ["都|dōu", "一起|yìqǐ"] }, { s: ["做作业|zuò zuòyè", "上体育课|shàng tǐyù kè", "去学校|qù xuéxiào"] }, "。|."],
        ex: "我们一起做作业。|Wǒmen yìqǐ zuò zuòyè.|We do homework together." },
    ],
    errors: [
      { ok: "我们都喜欢数学。", bad: ["我们喜欢都数学。", "都我们喜欢数学。"], tip: "都 and 也 go right before the verb." },
    ],
    fill: [
      { q: "我和我朋友___喜欢体育课。", o: ["都", "很", "比", "又"], a: 0, en: "My friend and I both like PE." },
    ],
  },
  {
    id: "c2", zone: "c2", week: 7, title: "心情", en: "Feelings", when: "Week 7",
    words: ["高兴|gāoxìng|happy", "开心|kāixīn|happy; joyful", "难过|nánguò|sad", "紧张|jǐnzhāng|nervous", "有趣|yǒuqù|interesting; fun", "无聊|wúliáo|boring"],
    frames: [
      { q: "先……再……然后……|xiān… zài… ránhòu…|first … then … after that …",
        t: [{ s: ["我|wǒ", "我们|wǒmen"] }, "先|xiān", { s: ["吃饭|chīfàn", "做作业|zuò zuòyè"] }, "，|,", "再|zài", { s: ["洗澡|xǐzǎo", "看书|kànshū"] }, "，|,", "然后|ránhòu", { s: ["睡觉|shuìjiào", "玩游戏|wán yóuxì"] }, "。|."],
        ex: "我先做作业，再看书，然后睡觉。|Wǒ xiān zuò zuòyè, zài kànshū, ránhòu shuìjiào.|First I do homework, then I read, then I go to bed." },
      { q: "为什么很紧张？|Wèishénme hěn jǐnzhāng?|Why so nervous?",
        t: [{ s: ["我|wǒ", "他|tā"] }, "今天很|jīntiān hěn", { s: ["紧张|jǐnzhāng", "高兴|gāoxìng", "难过|nánguò"] }, "，|,", "因为|yīnwèi", { s: ["明天有考试|míngtiān yǒu kǎoshì", "成绩很好|chéngjì hěn hǎo", "朋友不在|péngyou bú zài"], link: 1 }, "。|."],
        ex: "我今天很紧张，因为明天有考试。|Wǒ jīntiān hěn jǐnzhāng, yīnwèi míngtiān yǒu kǎoshì.|I'm nervous today because there's a test tomorrow." },
    ],
    fill: [
      { q: "我先吃饭，___做作业。", o: ["再", "也", "都", "比"], a: 0, en: "First I eat, then I do homework." },
      { q: "历史课很___，我很喜欢。", o: ["有趣", "无聊", "难过", "紧张"], a: 0, en: "History is interesting. I like it a lot." },
    ],
  },
  {
    id: "c3", zone: "c2", week: 10, title: "名字的意思", en: "What a name means", when: "Week 10",
    words: ["意思|yìsi|meaning", "代表|dàibiǎo|to stand for", "希望|xīwàng|to hope", "选|xuǎn|to choose", "印章|yìnzhāng|name seal", "姓|xìng|surname; to be surnamed"],
    frames: [
      { q: "你姓什么？|Nǐ xìng shénme?|What's your surname?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, "姓|xìng", { s: ["林|Lín", "王|Wáng", "李|Lǐ"] }, "，|,", "叫|jiào", { s: ["林海|Lín Hǎi", "王明|Wáng Míng", "李小美|Lǐ Xiǎoměi"], link: 1 }, "。|."],
        ex: "我姓林，叫林海。|Wǒ xìng Lín, jiào Lín Hǎi.|My surname is Lin; my name is Lin Hai." },
      { q: "我希望……|wǒ xīwàng…|I hope …",
        t: [{ s: ["我|wǒ", "我妈妈|wǒ māma"] }, "希望|xīwàng", { s: ["我很努力|wǒ hěn nǔlì", "我成绩很好|wǒ chéngjì hěn hǎo", "明天不忙|míngtiān bù máng"] }, "。|."],
        ex: "我希望我成绩很好。|Wǒ xīwàng wǒ chéngjì hěn hǎo.|I hope I get good grades." },
    ],
    fill: [
      { q: "你的名字是什么___？", o: ["意思", "代表", "希望", "印章"], a: 0, en: "What does your name mean?" },
    ],
    tip: "Parts carry meaning: 氵 is about water (海, 江), 木 is about trees (林), 心/忄 is about feelings (想, 快).",
  },

  // ───────── C3a · Community (Weeks 11–13) ─────────
  {
    id: "d1", zone: "c3", week: 11, title: "我家附近", en: "Around my home", when: "Week 11",
    words: [
      "地方|dìfang|place", "附近|fùjìn|nearby", "商店|shāngdiàn|shop", "超市|chāoshì|supermarket", "银行|yínháng|bank",
      "商场|shāngchǎng|shopping mall", "饭馆|fànguǎn|restaurant", "图书馆|túshūguǎn|library", "公园|gōngyuán|park",
    ],
    review: ["医院", "哪儿"],
    youzai: true,
    frames: [
      { q: "银行在哪儿？|Yínháng zài nǎr?|Where is the bank?",
        t: [{ s: ["银行|yínháng", "超市|chāoshì", "图书馆|túshūguǎn"] }, "在|zài", { s: ["学校|xuéxiào", "我家|wǒ jiā"] }, "附近|fùjìn", "。|."],
        ex: "银行在学校附近。|Yínháng zài xuéxiào fùjìn.|The bank is near the school." },
      { q: "你家附近有什么？|Nǐ jiā fùjìn yǒu shénme?|What's near your home?",
        t: [{ s: ["我家|wǒ jiā", "学校|xuéxiào"] }, "附近|fùjìn", { s: ["有|yǒu", "没有|méiyǒu"] }, { s: ["一个公园|yí ge gōngyuán", "一个超市|yí ge chāoshì", "商场|shāngchǎng"] }, "。|."],
        ex: "我家附近有一个公园。|Wǒ jiā fùjìn yǒu yí ge gōngyuán.|There's a park near my home." },
      { q: "去哪儿做什么？|Qù nǎr zuò shénme?|Go where to do what?",
        t: ["我去|wǒ qù", { s: ["图书馆|túshūguǎn", "饭馆|fànguǎn", "公园|gōngyuán"] }, { s: ["看书|kànshū", "吃饭|chīfàn", "跑步|pǎobù"], link: 0 }, "。|."],
        ex: "我去图书馆看书。|Wǒ qù túshūguǎn kànshū.|I go to the library to read." },
    ],
    errors: [
      { ok: "学校附近有银行。", bad: ["学校附近在银行。"], tip: "Place first → 有. Thing first → 在." },
    ],
    fill: [
      { q: "我家附近___一个超市。", o: ["有", "在", "是", "去"], a: 0, en: "There's a supermarket near my home." },
      { q: "银行___学校附近。", o: ["在", "有", "是", "去"], a: 0, en: "The bank is near the school." },
    ],
    tip: "钅 is about metal and money (银, 钱). 饣 is about food (饭, 馆). 土 is about ground and places (场, 地). Don't mix up 银 and 很.",
  },
  {
    id: "d2", zone: "c3", week: 12, title: "怎么走？", en: "Finding the way", when: "Week 12",
    words: [
      "前面|qiánmian|in front", "后面|hòumian|behind", "左边|zuǒbian|left side", "右边|yòubian|right side",
      "旁边|pángbiān|next to", "对面|duìmiàn|opposite; across from", "离|lí|(distance) from", "远|yuǎn|far",
      "近|jìn|near", "往|wǎng|towards", "走|zǒu|to walk; to go", "拐|guǎi|to turn",
    ],
    frames: [
      { q: "……在哪儿？|… zài nǎr?|Where is …?",
        t: [{ s: ["银行|yínháng", "医院|yīyuàn", "图书馆|túshūguǎn"] }, "在|zài", { s: ["超市|chāoshì", "公园|gōngyuán", "学校|xuéxiào"] }, "的|de", { s: ["旁边|pángbiān", "对面|duìmiàn", "前面|qiánmian", "后面|hòumian"] }, "。|."],
        ex: "银行在超市的旁边。|Yínháng zài chāoshì de pángbiān.|The bank is next to the supermarket." },
      { q: "远不远？|Yuǎn bu yuǎn?|Is it far?",
        t: [{ s: ["我家|wǒ jiā", "图书馆|túshūguǎn", "公园|gōngyuán"] }, "离|lí", { s: ["学校|xuéxiào", "这儿|zhèr"] }, { s: ["很远|hěn yuǎn", "不远|bù yuǎn", "很近|hěn jìn"] }, "。|."],
        ex: "我家离学校很近。|Wǒ jiā lí xuéxiào hěn jìn.|My home is close to school." },
      { q: "怎么走？|Zěnme zǒu?|How do I get there?",
        t: ["先往前走|xiān wǎng qián zǒu", "，|,", "再往|zài wǎng", { s: ["左|zuǒ", "右|yòu"] }, "拐|guǎi", "，|,", { s: ["银行|yínháng", "图书馆|túshūguǎn"] }, "在你的|zài nǐ de", { s: ["左边|zuǒbian", "右边|yòubian"] }, "。|."],
        ex: "先往前走，再往右拐，图书馆在你的左边。|Xiān wǎng qián zǒu, zài wǎng yòu guǎi, túshūguǎn zài nǐ de zuǒbian.|Go straight, then turn right; the library is on your left." },
    ],
    errors: [
      { ok: "我家离学校很近。", bad: ["我家从学校很近。"], tip: "Use 离 for distance: A 离 B 很近." },
      { ok: "银行在超市的旁边。", bad: ["银行在旁边的超市。"], tip: "Thing + 在 + place + 的 + position." },
    ],
    fill: [
      { q: "图书馆___学校不远。", o: ["离", "在", "往", "有"], a: 0, en: "The library isn't far from school." },
      { q: "先往前走，再___左拐。", o: ["往", "离", "在", "去"], a: 0, en: "Go straight, then turn left." },
    ],
    tip: "辶 is about walking: 远, 近, 边, 这, 还. 左 or 右? 右 has a mouth 口, and you eat with your right hand.",
  },
  {
    id: "d3", zone: "c3", week: 13, title: "我觉得……", en: "Giving opinions", when: "Week 13",
    words: [
      "觉得|juéde|to think; to feel (opinion)", "方便|fāngbiàn|convenient", "安静|ānjìng|quiet",
      "热闹|rènao|lively; busy (with people)", "干净|gānjìng|clean", "中间|zhōngjiān|between; in the middle",
      "一直|yìzhí|straight on", "地图|dìtú|map",
    ],
    review: ["因为", "所以", "附近"],
    frames: [
      { q: "你觉得……怎么样？|Nǐ juéde … zěnmeyàng?|What do you think of …?",
        t: ["我觉得|wǒ juéde", { s: ["这个公园|zhège gōngyuán", "图书馆|túshūguǎn", "商场|shāngchǎng"] }, "很|hěn", { s: ["安静|ānjìng", "热闹|rènao", "干净|gānjìng", "方便|fāngbiàn"] }, "。|."],
        ex: "我觉得这个公园很安静。|Wǒ juéde zhège gōngyuán hěn ānjìng.|I think this park is quiet." },
      { q: "我觉得……，因为……|Wǒ juéde …, yīnwèi …|I think …, because …",
        t: ["我觉得|wǒ juéde", { s: ["商场|shāngchǎng", "超市|chāoshì", "图书馆|túshūguǎn"] }, "很|hěn", { s: ["方便|fāngbiàn", "干净|gānjìng", "安静|ānjìng"] }, "，|,", "因为|yīnwèi", { s: ["离我家很近|lí wǒ jiā hěn jìn", "人不多|rén bù duō"] }, "。|."],
        ex: "我觉得商场很方便，因为离我家很近。|Wǒ juéde shāngchǎng hěn fāngbiàn, yīnwèi lí wǒ jiā hěn jìn.|I think the mall is convenient because it's close to my home." },
      { q: "……在哪儿？|… zài nǎr?|Where is …?",
        t: [{ s: ["银行|yínháng", "公园|gōngyuán", "图书馆|túshūguǎn"] }, "在|zài", { s: ["超市和饭馆|chāoshì hé fànguǎn", "学校和医院|xuéxiào hé yīyuàn"] }, "中间|zhōngjiān", "。|."],
        ex: "银行在超市和饭馆中间。|Yínháng zài chāoshì hé fànguǎn zhōngjiān.|The bank is between the supermarket and the restaurant." },
      { q: "怎么走？|Zěnme zǒu?|How do I get there?",
        t: ["一直|yìzhí", "往前走|wǎng qián zǒu", "，|,", "然后往|ránhòu wǎng", { s: ["左|zuǒ", "右|yòu"] }, "拐|guǎi", "。|."],
        ex: "一直往前走，然后往左拐。|Yìzhí wǎng qián zǒu, ránhòu wǎng zuǒ guǎi.|Go straight on, then turn left." },
    ],
    errors: [
      { ok: "我觉得图书馆很安静。", bad: ["我觉得图书馆安静很。"], tip: "很 comes before the adjective: 很安静." },
      { ok: "银行在超市和饭馆中间。", bad: ["银行在中间超市和饭馆。"], tip: "A 在 B 和 C 中间: 中间 goes at the end." },
      { ok: "这个公园很干净。", bad: ["这个公园很干静。"], tip: "干净 = clean (净 has 冫, like clear water). 安静 = quiet." },
    ],
    fill: [
      { q: "你觉得这个商场___？", o: ["怎么样", "什么", "哪儿", "几"], a: 0, en: "What do you think of this mall?" },
      { q: "我觉得商场很方便，___离我家很近。", o: ["因为", "所以", "但是", "然后"], a: 0, en: "I think the mall is convenient because it's close to my home." },
      { q: "图书馆人不多，很___。", o: ["安静", "热闹", "方便", "干净"], a: 0, en: "There aren't many people in the library. It's very quiet." },
    ],
    tip: "青 gives the sound: 静, 净, 请 and 情 all sound like qing / jing. 静 or 净? 净 has 冫 (water), so it means clean. 闹 = 市 (market) inside a 门 (door): noisy and lively.",
  },
  {
    id: "d4", zone: "c3", week: 14, title: "多少钱？", en: "Shopping: how much is it?", when: "Week 14",
    words: [
      "买|mǎi|to buy", "卖|mài|to sell", "东西|dōngxi|thing; stuff", "块|kuài|kuai (spoken unit of money)",
      "钱|qián|money", "一共|yígòng|altogether; in total", "试|shì|to try (on)",
      "件|jiàn|measure word for tops (一件衬衫)", "双|shuāng|a pair (一双鞋子)", "条|tiáo|measure word for long things (一条裤子)",
      "太……了|tài……le|too … (太贵了)", "便宜一点儿|piányi yìdiǎnr|a bit cheaper",
    ],
    review: ["贵", "便宜", "多少", "衣服", "衬衫"],
    frames: [
      { q: "这件衬衫多少钱？|Zhè jiàn chènshān duōshao qián?|How much is this shirt?",
        t: [{ s: ["这件衬衫|zhè jiàn chènshān", "这双鞋子|zhè shuāng xiézi", "这条裙子|zhè tiáo qúnzi"] }, { s: ["一百块|yìbǎi kuài", "二百块|èrbǎi kuài", "一百五十块|yìbǎi wǔshí kuài"] }, "。|."],
        ex: "这件衬衫一百块。|Zhè jiàn chènshān yìbǎi kuài.|This shirt is 100 kuai." },
      { q: "你要买什么？|Nǐ yào mǎi shénme?|What would you like to buy?",
        t: ["我要|wǒ yào", { s: ["一件衬衫|yí jiàn chènshān", "两双鞋子|liǎng shuāng xiézi", "一条裤子|yì tiáo kùzi"] }, "。|."],
        ex: "我要两双鞋子。|Wǒ yào liǎng shuāng xiézi.|I'd like two pairs of shoes." },
      { q: "太贵了？讲价！|Tài guì le? Jiǎngjià!|Too expensive? Bargain!",
        t: ["太贵了|tài guì le", "！|!", "便宜一点儿吧|piányi yìdiǎnr ba", "。|."],
        ex: "太贵了！便宜一点儿吧。|Tài guì le! Piányi yìdiǎnr ba.|Too expensive! A bit cheaper, please." },
      { q: "一共多少钱？|Yígòng duōshao qián?|How much altogether?",
        t: ["我买|wǒ mǎi", { s: ["一件衬衫|yí jiàn chènshān", "一条裙子|yì tiáo qúnzi"] }, "和|hé", "一双鞋子|yì shuāng xiézi", "，|,", "一共|yígòng", { s: ["三百块|sānbǎi kuài", "二百五十块|èrbǎi wǔshí kuài"] }, "。|."],
        ex: "我买一件衬衫和一双鞋子，一共三百块。|Wǒ mǎi yí jiàn chènshān hé yì shuāng xiézi, yígòng sānbǎi kuài.|I'm buying a shirt and a pair of shoes: 300 kuai altogether." },
      { q: "我可以试试吗？|Wǒ kěyǐ shìshi ma?|Can I try it on?",
        t: ["我|wǒ", "可以|kěyǐ", "试试|shìshi", { s: ["这件|zhè jiàn", "那双|nà shuāng", "这条|zhè tiáo"] }, "吗|ma", "？|?"],
        ex: "我可以试试这件吗？|Wǒ kěyǐ shìshi zhè jiàn ma?|Can I try this one on?" },
    ],
    fill: [
      { q: "一___衬衫", o: ["件", "双", "条", "个"], a: 0, en: "a shirt" },
      { q: "一___鞋子", o: ["双", "件", "条", "本"], a: 0, en: "a pair of shoes" },
      { q: "一___裤子", o: ["条", "件", "双", "个"], a: 0, en: "a pair of trousers" },
      { q: "我想___一件衬衫。（buy）", o: ["买", "卖", "试", "穿"], a: 0, en: "I want to buy a shirt." },
      { q: "这个商店___衣服。（sell）", o: ["卖", "买", "试", "看"], a: 0, en: "This shop sells clothes." },
      { q: "一件一百块，一双二百块，___三百块。", o: ["一共", "太", "便宜", "多少"], a: 0, en: "100 + 200 = 300 altogether." },
    ],
    errors: [
      { ok: "这件衬衫太贵了！|Zhè jiàn chènshān tài guì le!", bad: ["这件衬衫太贵！|Zhè jiàn chènshān tài guì!", "这件衬衫很贵了！|Zhè jiàn chènshān hěn guì le!"], tip: "太 + adjective + 了 go together: 太贵了." },
      { ok: "我要两双鞋子。|Wǒ yào liǎng shuāng xiézi.", bad: ["我要两个鞋子。|Wǒ yào liǎng gè xiézi.", "我要二双鞋子。|Wǒ yào èr shuāng xiézi."], tip: "Shoes come in pairs: 双. Use 两 before a measure word." },
      { ok: "一共多少钱？|Yígòng duōshao qián?", bad: ["多少钱一共？|Duōshao qián yígòng?"], tip: "一共 comes first: 一共 + 多少钱." },
    ],
    tip: "The customer's 4 steps: 看一看 → 问一问 → 谈一谈 → 买不买. 贝 inside 买 · 卖 · 贵 means money.",
  },
];
