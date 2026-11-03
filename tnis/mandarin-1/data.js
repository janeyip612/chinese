// Mandarin I learning map — content data.
// Sources: Notion "Word list - Mandarin I" (Weeks 2–7) and the Mandarin I weekly lesson plans, Weeks 10–13.
// Weeks 1, 5, 8 and 9 had no new words (diagnostic, review, mid-term).
// Word format: "汉字|pinyin|English". Frame tokens: "汉字|pinyin" fixed, or {s:[...], link:i} slot.
// A slot with link:i always takes the same option index as slot i (i counts slots only).
// Error items: "汉字|pinyin" strings.

const CURRENT_WEEK = 13;

// Teacher-set focus for this week's Daily review (update every Friday).
const FOCUS = {
  week: 13,
  why: "Get ready to talk about your day: days of the week, times and what you do.",
  stations: ["s12", "s13", "s9"],
};

const ZONES = [
  { id: "b1", name: "Hello & me", zh: "认识你", color: "--line-y" },
  { id: "b3", name: "Classroom & school", zh: "教室与校园", color: "--line-u1" },
  { id: "b2", name: "Names, dates & questions", zh: "名字·日期·问题", color: "--line-c2" },
  { id: "b4", name: "Unit 3 · My day", zh: "我的一天", color: "--line-c3" },
];

const STATIONS = [
  // ───────── Hello & me (Weeks 2–4) ─────────
  {
    id: "s1", zone: "b1", week: 2, title: "你好！", en: "Hello!", when: "Week 2",
    words: [
      "你好|nǐ hǎo|hello", "你好吗|nǐ hǎo ma|how are you?", "谢谢|xièxie|thank you", "再见|zàijiàn|goodbye",
      "我|wǒ|I; me", "你|nǐ|you", "人|rén|person",
    ],
    frames: [],
    fill: [
      { q: "___！— 再见！", o: ["再见", "谢谢", "你好吗", "人"], a: 0, en: "Goodbye! — Goodbye!" },
    ],
    tip: "人 looks like a person walking: two legs.",
  },
  {
    id: "s2", zone: "b1", week: 2, title: "数字", en: "Numbers", when: "Weeks 2 & 7",
    words: [
      "一|yī|one", "二|èr|two", "三|sān|three", "四|sì|four", "五|wǔ|five",
      "六|liù|six", "七|qī|seven", "八|bā|eight", "九|jiǔ|nine", "十|shí|ten", "百|bǎi|hundred",
    ],
    frames: [],
    fill: [
      { q: "十五 = ___", o: ["15", "50", "105", "5"], a: 0, en: "fifteen" },
      { q: "九十九 = ___", o: ["99", "19", "90", "909"], a: 0, en: "ninety-nine" },
      { q: "一___ = 100", o: ["百", "十", "个", "点"], a: 0, en: "one hundred" },
    ],
    tip: "Numbers are a building game: 二十五 = 2 × 10 + 5. You only need 一 to 十 and 百.",
  },
  {
    id: "s3", zone: "b1", week: 3, title: "我是学生", en: "I'm a student", when: "Week 3",
    words: [
      "是|shì|to be", "叫|jiào|to be called", "名字|míngzi|name", "学生|xuésheng|student", "老师|lǎoshī|teacher",
      "朋友|péngyou|friend", "爸爸|bàba|dad", "妈妈|māma|mum", "很|hěn|very", "好|hǎo|good; well",
      "的|de|'s (my, your …)", "他|tā|he; him", "她|tā|she; her",
    ],
    frames: [
      { q: "你叫什么名字？|Nǐ jiào shénme míngzi?|What's your name?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, "叫|jiào", { s: ["安安|Ān'an", "小美|Xiǎoměi", "大明|Dàmíng"] }, "。|."],
        ex: "我叫小美。|Wǒ jiào Xiǎoměi.|My name is Xiaomei." },
      { q: "你是谁？|Nǐ shì shéi?|Who are you?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, "是|shì", { s: ["学生|xuésheng", "老师|lǎoshī", "我的朋友|wǒ de péngyou"] }, "。|."],
        ex: "她是我的朋友。|Tā shì wǒ de péngyou.|She is my friend." },
      { q: "你好吗？|Nǐ hǎo ma?|How are you?",
        t: [{ s: ["我|wǒ", "我爸爸|wǒ bàba", "我妈妈|wǒ māma"] }, "很好|hěn hǎo", "。|."],
        ex: "我很好。|Wǒ hěn hǎo.|I'm very well." },
    ],
    fill: [
      { q: "我___学生。", o: ["是", "叫", "有", "很"], a: 0, en: "I am a student." },
      { q: "我的名字___安安。", o: ["叫", "有", "很", "爱"], a: 0, en: "My name is An'an." },
    ],
    errors: [
      { ok: "我很好。|Wǒ hěn hǎo.", bad: ["我是很好。|Wǒ shì hěn hǎo.", "我好很。|Wǒ hǎo hěn."], tip: "很 + adjective, with no 是: 我很好。" },
    ],
  },
  {
    id: "s4", zone: "b1", week: 4, title: "我的家", en: "My family", when: "Week 4",
    words: [
      "有|yǒu|to have; there is", "没有|méiyǒu|not have; there isn't", "个|gè|(measure word for people and things)",
      "家人|jiārén|family members", "哥哥|gēge|older brother", "姐姐|jiějie|older sister", "弟弟|dìdi|younger brother",
      "妹妹|mèimei|younger sister", "爱|ài|to love", "越南人|Yuènánrén|Vietnamese (person)", "韩国人|Hánguórén|Korean (person)",
      "印度人|Yìndùrén|Indian (person)",
    ],
    frames: [
      { q: "你有哥哥吗？|Nǐ yǒu gēge ma?|Do you have an older brother?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, { s: ["有一个|yǒu yí ge", "没有|méiyǒu"] }, { s: ["哥哥|gēge", "姐姐|jiějie", "弟弟|dìdi", "妹妹|mèimei"] }, "。|."],
        ex: "我有一个妹妹。|Wǒ yǒu yí ge mèimei.|I have a younger sister." },
      { q: "你是不是越南人？|Nǐ shì bu shì Yuènánrén?|Are you Vietnamese?",
        t: [{ s: ["我|wǒ", "我妈妈|wǒ māma", "我的朋友|wǒ de péngyou"] }, "是|shì", { s: ["越南人|Yuènánrén", "韩国人|Hánguórén", "印度人|Yìndùrén"] }, "。|."],
        ex: "我是越南人。|Wǒ shì Yuènánrén.|I'm Vietnamese." },
      { q: "你爱谁？|Nǐ ài shéi?|Who do you love?",
        t: ["我|wǒ", "爱|ài", { s: ["我的家人|wǒ de jiārén", "我妈妈|wǒ māma", "我爸爸|wǒ bàba"] }, "。|."],
        ex: "我爱我的家人。|Wǒ ài wǒ de jiārén.|I love my family." },
    ],
    fill: [
      { q: "我___一个哥哥。", o: ["有", "是", "叫", "爱"], a: 0, en: "I have an older brother." },
      { q: "我___有妹妹。", o: ["没", "不", "很", "是"], a: 0, en: "I don't have a younger sister." },
    ],
    errors: [
      { ok: "我没有弟弟。|Wǒ méiyǒu dìdi.", bad: ["我不有弟弟。|Wǒ bù yǒu dìdi.", "我有没弟弟。|Wǒ yǒu méi dìdi."], tip: "有 always takes 没: 没有, never 不有." },
    ],
  },

  // ───────── Classroom & school (Weeks 6–7) ─────────
  {
    id: "s5", zone: "b3", week: 6, title: "教室里", en: "In the classroom", when: "Week 6",
    words: [
      "教室|jiàoshì|classroom", "黑板|hēibǎn|blackboard", "桌子|zhuōzi|desk; table", "椅子|yǐzi|chair", "书|shū|book",
      "笔|bǐ|pen", "本子|běnzi|notebook", "门|mén|door", "窗户|chuānghu|window", "书包|shūbāo|schoolbag",
      "这|zhè|this", "那|nà|that",
    ],
    frames: [
      { q: "这是什么？|Zhè shì shénme?|What is this?",
        t: [{ s: ["这|zhè", "那|nà"] }, "是|shì", { s: ["我的书|wǒ de shū", "你的笔|nǐ de bǐ", "老师的桌子|lǎoshī de zhuōzi", "我的书包|wǒ de shūbāo"] }, "。|."],
        ex: "这是我的书包。|Zhè shì wǒ de shūbāo.|This is my schoolbag." },
      { q: "你有本子吗？|Nǐ yǒu běnzi ma?|Do you have a notebook?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, { s: ["有|yǒu", "没有|méiyǒu"] }, { s: ["本子|běnzi", "笔|bǐ", "书包|shūbāo"] }, "。|."],
        ex: "我没有笔。|Wǒ méiyǒu bǐ.|I don't have a pen." },
    ],
    fill: [
      { q: "___是我的笔。", o: ["这", "谁", "几", "什么"], a: 0, en: "This is my pen." },
    ],
    errors: [
      { ok: "这是我的书。|Zhè shì wǒ de shū.", bad: ["这是书我的。|Zhè shì shū wǒ de.", "这我的是书。|Zhè wǒ de shì shū."], tip: "的 comes before the thing: 我的书 = my book." },
    ],
  },
  {
    id: "s6", zone: "b3", week: 7, title: "颜色、大小", en: "Colours & size", when: "Week 7",
    words: [
      "红色|hóngsè|red", "黄色|huángsè|yellow", "蓝色|lánsè|blue", "绿色|lǜsè|green", "黑色|hēisè|black", "白色|báisè|white",
      "大|dà|big", "小|xiǎo|small",
    ],
    frames: [
      { q: "你的书包是红色的吗？|Nǐ de shūbāo shì hóngsè de ma?|Is your schoolbag red?",
        t: [{ s: ["我的书包|wǒ de shūbāo", "我的笔|wǒ de bǐ", "老师的桌子|lǎoshī de zhuōzi"] }, "是|shì", { s: ["红色|hóngsè", "蓝色|lánsè", "黑色|hēisè", "白色|báisè"] }, "的|de", "。|."],
        ex: "我的书包是蓝色的。|Wǒ de shūbāo shì lánsè de.|My schoolbag is blue." },
      { q: "你的书包大吗？|Nǐ de shūbāo dà ma?|Is your schoolbag big?",
        t: [{ s: ["我的书包|wǒ de shūbāo", "这个桌子|zhège zhuōzi"] }, "很|hěn", { s: ["大|dà", "小|xiǎo"] }, "。|."],
        ex: "我的书包很大。|Wǒ de shūbāo hěn dà.|My schoolbag is big." },
    ],
    fill: [
      { q: "我的书包是红色___。", o: ["的", "吗", "是", "很"], a: 0, en: "My schoolbag is red." },
    ],
    tip: "Every colour ends in 色 (sè, colour): 红色, 蓝色, 黑色 …",
  },

  // ───────── Names, dates & questions (Weeks 10–12) ─────────
  {
    id: "s7", zone: "b2", week: 10, title: "名字、生日", en: "Names & birthdays", when: "Week 10",
    words: [
      "姓|xìng|surname; to be surnamed", "中文|Zhōngwén|Chinese (language)", "年|nián|year", "月|yuè|month; moon",
      "日|rì|day (written dates); sun", "号|hào|day of the month (spoken)", "几|jǐ|which; how many", "今天|jīntiān|today",
      "生日|shēngrì|birthday", "快乐|kuàilè|happy",
    ],
    frames: [
      { q: "你姓什么？|Nǐ xìng shénme?|What's your surname?",
        t: ["我|wǒ", "姓|xìng", { s: ["阮|Ruǎn", "陈|Chén", "李|Lǐ"] }, "，|,", "我的中文名字叫|wǒ de Zhōngwén míngzi jiào", { s: ["阮安|Ruǎn Ān", "陈小月|Chén Xiǎoyuè", "李大明|Lǐ Dàmíng"], link: 0 }, "。|."],
        ex: "我姓阮，我的中文名字叫阮安。|Wǒ xìng Ruǎn, wǒ de Zhōngwén míngzi jiào Ruǎn Ān.|My surname is Ruan; my Chinese name is Ruan An." },
      { q: "今天是几月几号？|Jīntiān shì jǐ yuè jǐ hào?|What's the date today?",
        t: ["今天是|jīntiān shì", { s: ["十一月|shíyī yuè", "十月|shí yuè", "三月|sān yuè"] }, { s: ["三号|sān hào", "十二号|shí'èr hào", "二十号|èrshí hào"] }, "。|."],
        ex: "今天是十一月三号。|Jīntiān shì shíyī yuè sān hào.|Today is 3 November." },
      { q: "你的生日是几月几号？|Nǐ de shēngrì shì jǐ yuè jǐ hào?|When is your birthday?",
        t: [{ s: ["我的生日|wǒ de shēngrì", "我妈妈的生日|wǒ māma de shēngrì"] }, "是|shì", { s: ["一月|yī yuè", "五月|wǔ yuè", "十二月|shí'èr yuè"] }, { s: ["六号|liù hào", "十五号|shíwǔ hào", "三十号|sānshí hào"] }, "。|."],
        ex: "我的生日是五月十五号。|Wǒ de shēngrì shì wǔ yuè shíwǔ hào.|My birthday is 15 May." },
    ],
    fill: [
      { q: "你的生日是___月几号？", o: ["几", "什么", "谁", "吗"], a: 0, en: "When is your birthday?" },
      { q: "生日___！", o: ["快乐", "好", "大", "很"], a: 0, en: "Happy birthday!" },
    ],
    errors: [
      { ok: "今天是十月五号。|Jīntiān shì shí yuè wǔ hào.", bad: ["今天是五号十月。|Jīntiān shì wǔ hào shí yuè.", "今天是五十月号。|Jīntiān shì wǔshí yuè hào."], tip: "Big to small: month first, then the day. Say 号, write 日." },
    ],
  },
  {
    id: "s8", zone: "b2", week: 11, title: "问题工具箱", en: "Question toolbox", when: "Week 11",
    words: [
      "谁|shéi|who", "什么|shénme|what", "吗|ma|(turns a sentence into a yes/no question)", "不|bù|not",
      "今年|jīnnián|this year", "岁|suì|years old", "喜欢|xǐhuan|to like", "手机|shǒujī|mobile phone",
      "音乐|yīnyuè|music", "运动|yùndòng|sport; exercise",
    ],
    frames: [
      { q: "你喜欢什么？|Nǐ xǐhuan shénme?|What do you like?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, { s: ["喜欢|xǐhuan", "不喜欢|bù xǐhuan"] }, { s: ["音乐|yīnyuè", "运动|yùndòng", "手机|shǒujī", "中文|Zhōngwén"] }, "。|."],
        ex: "我喜欢音乐，不喜欢运动。|Wǒ xǐhuan yīnyuè, bù xǐhuan yùndòng.|I like music, not sport." },
      { q: "你今年几岁？|Nǐ jīnnián jǐ suì?|How old are you this year?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, "今年|jīnnián", { s: ["十四|shísì", "十五|shíwǔ", "十六|shíliù"] }, "岁|suì", "。|."],
        ex: "我今年十五岁。|Wǒ jīnnián shíwǔ suì.|I'm fifteen this year." },
      { q: "他是谁？|Tā shì shéi?|Who is he?",
        t: [{ s: ["他|tā", "她|tā"] }, "是|shì", { s: ["我的朋友|wǒ de péngyou", "我哥哥|wǒ gēge", "我的老师|wǒ de lǎoshī"] }, "。|."],
        ex: "他是我哥哥。|Tā shì wǒ gēge.|He is my older brother." },
    ],
    fill: [
      { q: "你喜欢音乐___？", o: ["吗", "什么", "谁", "几"], a: 0, en: "Do you like music?" },
      { q: "他是___？", o: ["谁", "几", "吗", "很"], a: 0, en: "Who is he?" },
      { q: "我___喜欢运动。", o: ["不", "没", "很", "是"], a: 0, en: "I don't like sport." },
    ],
    errors: [
      { ok: "你喜欢什么？|Nǐ xǐhuan shénme?", bad: ["什么你喜欢？|Shénme nǐ xǐhuan?", "你什么喜欢？|Nǐ shénme xǐhuan?"], tip: "Put the question word where the answer goes: 我喜欢音乐 → 你喜欢什么？" },
      { ok: "我不喜欢运动。|Wǒ bù xǐhuan yùndòng.", bad: ["我没喜欢运动。|Wǒ méi xǐhuan yùndòng.", "我喜欢不运动。|Wǒ xǐhuan bù yùndòng."], tip: "喜欢 and 是 take 不: 不喜欢, 不是. Only 有 takes 没." },
    ],
  },
  {
    id: "s9", zone: "b2", week: 11, title: "现在几点？", en: "What time is it?", when: "Week 11",
    words: [
      "现在|xiànzài|now", "点|diǎn|o'clock", "分|fēn|minute", "两|liǎng|two (two o'clock: 两点)",
    ],
    frames: [
      { q: "现在几点？|Xiànzài jǐ diǎn?|What time is it now?",
        t: ["现在|xiànzài", { s: ["两点|liǎng diǎn", "三点二十分|sān diǎn èrshí fēn", "十二点十五分|shí'èr diǎn shíwǔ fēn", "七点|qī diǎn"] }, "。|."],
        ex: "现在两点二十分。|Xiànzài liǎng diǎn èrshí fēn.|It's 2:20 now." },
    ],
    fill: [
      { q: "2:00 = ___点", o: ["两", "二", "十二", "几"], a: 0, en: "two o'clock" },
      { q: "现在___点？", o: ["几", "什么", "谁", "吗"], a: 0, en: "What time is it now?" },
    ],
    errors: [
      { ok: "现在两点。|Xiànzài liǎng diǎn.", bad: ["现在二点。|Xiànzài èr diǎn.", "现在点两。|Xiànzài diǎn liǎng."], tip: "For the hour, 2 is 两: 两点. Minutes keep 二: 两点二十分." },
    ],
    tip: "Hour first, then minutes, just like Vietnamese: bảy giờ mười phút = 七点十分.",
  },
  {
    id: "s10", zone: "b2", week: 12, title: "请坐！", en: "Classroom Chinese", when: "Week 12",
    words: [
      "请坐|qǐng zuò|please sit down", "站起来|zhàn qǐlai|stand up", "打开|dǎkāi|to open", "看|kàn|to look; to read",
      "听|tīng|to listen", "说|shuō|to say; to speak", "我不懂|wǒ bù dǒng|I don't understand",
      "请再说一遍|qǐng zài shuō yí biàn|please say it again",
    ],
    frames: [
      { q: "老师说什么？|Lǎoshī shuō shénme?|What does the teacher say?",
        t: ["请|qǐng", { s: ["看|kàn", "听|tīng", "打开书|dǎkāi shū", "说|shuō"] }, "。|."],
        ex: "请打开书。|Qǐng dǎkāi shū.|Please open your book." },
    ],
    fill: [
      { q: "请再___一遍。", o: ["说", "看", "听", "坐"], a: 0, en: "Please say it again." },
      { q: "我不___。", o: ["懂", "说", "坐", "听"], a: 0, en: "I don't understand." },
    ],
    tip: "Lost? Don't switch to English. Say 我不懂 or 请再说一遍.",
  },
  {
    id: "s11", zone: "b2", week: 12, title: "爷爷奶奶", en: "Grandparents", when: "Week 12",
    words: [
      "爷爷|yéye|grandpa (dad's dad)", "奶奶|nǎinai|grandma (dad's mum)", "外公|wàigōng|grandpa (mum's dad)", "外婆|wàipó|grandma (mum's mum)",
    ],
    frames: [
      { q: "你有爷爷奶奶吗？|Nǐ yǒu yéye nǎinai ma?|Do you have grandparents?",
        t: ["我|wǒ", { s: ["有|yǒu", "没有|méiyǒu"] }, { s: ["爷爷|yéye", "奶奶|nǎinai", "外公|wàigōng", "外婆|wàipó"] }, "。|."],
        ex: "我有外公。|Wǒ yǒu wàigōng.|I have a grandpa on my mum's side." },
      { q: "她叫什么？她喜欢什么？|Tā jiào shénme? Tā xǐhuan shénme?|What's her name? What does she like?",
        t: [{ s: ["他|tā", "她|tā"] }, "叫|jiào", { s: ["阮安|Ruǎn Ān", "陈小月|Chén Xiǎoyuè"] }, "，|,", { s: ["他|tā", "她|tā"], link: 0 }, "喜欢|xǐhuan", { s: ["音乐|yīnyuè", "运动|yùndòng"] }, "。|."],
        ex: "她叫陈小月，她喜欢音乐。|Tā jiào Chén Xiǎoyuè, tā xǐhuan yīnyuè.|Her name is Chen Xiaoyue; she likes music." },
    ],
    fill: [
      { q: "妈妈的爸爸是___。", o: ["外公", "爷爷", "奶奶", "外婆"], a: 0, en: "Mum's dad is …" },
      { q: "爸爸的妈妈是___。", o: ["奶奶", "外婆", "爷爷", "外公"], a: 0, en: "Dad's mum is …" },
    ],
    tip: "外 means outside: 外公 and 外婆 are on your mum's side.",
  },

  // ───────── Unit 3 · My day (Weeks 13–17) ─────────
  {
    id: "s12", zone: "b4", week: 13, title: "星期几？", en: "What day is it?", when: "Week 13",
    words: [
      "星期|xīngqī|week; day of the week", "天|tiān|day (星期天 = Sunday)", "明天|míngtiān|tomorrow", "昨天|zuótiān|yesterday",
      "每天|měitiān|every day", "半|bàn|half (七点半 = 7:30)",
    ],
    frames: [
      { q: "今天星期几？|Jīntiān xīngqī jǐ?|What day is it today?",
        t: [{ s: ["今天|jīntiān", "明天|míngtiān", "昨天|zuótiān"] }, "星期|xīngqī", { s: ["一|yī", "三|sān", "五|wǔ", "天|tiān"] }, "。|."],
        ex: "今天星期二。|Jīntiān xīngqī'èr.|Today is Tuesday." },
      { q: "现在几点？|Xiànzài jǐ diǎn?|What time is it now?",
        t: ["现在|xiànzài", { s: ["七点半|qī diǎn bàn", "三点半|sān diǎn bàn", "十点半|shí diǎn bàn"] }, "。|."],
        ex: "现在七点半。|Xiànzài qī diǎn bàn.|It's 7:30 now." },
    ],
    fill: [
      { q: "今天星期二，明天星期___。", o: ["三", "一", "四", "天"], a: 0, en: "Today is Tuesday; tomorrow is Wednesday." },
      { q: "Sunday = 星期___", o: ["天", "七", "八", "十"], a: 0, en: "Sunday" },
    ],
    errors: [
      { ok: "今天星期一。|Jīntiān xīngqīyī.", bad: ["今天一星期。|Jīntiān yì xīngqī.", "今天星期七。|Jīntiān xīngqīqī."], tip: "星期 + number: 星期一 … 星期六. Sunday is 星期天 (say) or 星期日 (write)." },
    ],
  },
  {
    id: "s13", zone: "b4", week: 13, title: "我的一天", en: "My day", when: "Week 13",
    words: [
      "起床|qǐchuáng|to get up", "睡觉|shuìjiào|to go to sleep", "上学|shàngxué|to go to school", "回家|huí jiā|to go home",
      "上课|shàngkè|class begins; to have class", "下课|xiàkè|class is over",
    ],
    frames: [
      { q: "你几点起床？|Nǐ jǐ diǎn qǐchuáng?|What time do you get up?",
        t: [{ s: ["我|wǒ", "他|tā", "她|tā"] }, { s: ["七点|qī diǎn", "七点半|qī diǎn bàn", "四点|sì diǎn", "十点|shí diǎn"] }, { s: ["起床|qǐchuáng", "上学|shàngxué", "回家|huí jiā", "睡觉|shuìjiào"], link: 1 }, "。|."],
        ex: "我七点起床。|Wǒ qī diǎn qǐchuáng.|I get up at seven." },
      { q: "你每天几点睡觉？|Nǐ měitiān jǐ diǎn shuìjiào?|What time do you go to sleep every day?",
        t: ["我|wǒ", "每天|měitiān", { s: ["十点|shí diǎn", "十点半|shí diǎn bàn", "九点|jiǔ diǎn"] }, "睡觉|shuìjiào", "。|."],
        ex: "我每天十点睡觉。|Wǒ měitiān shí diǎn shuìjiào.|I go to sleep at ten every day." },
      { q: "星期六你上学吗？|Xīngqīliù nǐ shàngxué ma?|Do you go to school on Saturday?",
        t: [{ s: ["星期六|xīngqīliù", "星期天|xīngqītiān"] }, "我|wǒ", "不|bú", { s: ["上学|shàngxué", "上课|shàngkè"] }, "。|."],
        ex: "星期六我不上学。|Xīngqīliù wǒ bú shàngxué.|I don't go to school on Saturday." },
    ],
    fill: [
      { q: "我七点___。（get up）", o: ["起床", "睡觉", "回家", "下课"], a: 0, en: "I get up at seven." },
      { q: "三点半___。（class is over）", o: ["下课", "上课", "起床", "上学"], a: 0, en: "Class is over at 3:30." },
    ],
    errors: [
      { ok: "我七点起床。|Wǒ qī diǎn qǐchuáng.", bad: ["我起床七点。|Wǒ qǐchuáng qī diǎn.", "起床我七点。|Qǐchuáng wǒ qī diǎn."], tip: "Time first, then ACTION! The time goes before the verb." },
      { ok: "我每天十点睡觉。|Wǒ měitiān shí diǎn shuìjiào.", bad: ["我睡觉每天十点。|Wǒ shuìjiào měitiān shí diǎn.", "我十点睡觉每天。|Wǒ shí diǎn shuìjiào měitiān."], tip: "每天 sits with the time, before the action." },
    ],
    tip: "Like a film: the director sets the scene (when), then shouts ACTION! 我 + time + action.",
  },
  { id: "s14", zone: "b4", week: 14, title: "早上·中午·晚上", en: "Morning, noon & evening", when: "Week 14", locked: true, words: [], frames: [] },
  { id: "s15", zone: "b4", week: 15, title: "吃什么？", en: "What do you eat?", when: "Week 15", locked: true, words: [], frames: [] },
  { id: "s16", zone: "b4", week: 16, title: "我要……", en: "Ordering food & drink", when: "Week 16", locked: true, words: [], frames: [] },
];
