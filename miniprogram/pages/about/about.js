var QUOTES = [
  { text: "Stay hungry, stay foolish, stay curious.", author: "Steve Jobs" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" }
]

var FACTS = [
  "GPT-4 拥有超过 1.7 万亿参数，训练成本超过 1 亿美元",
  "Transformer 论文发表于 2017 年，彻底改变了 NLP",
  "开源模型 Llama 3 在部分基准测试上已接近 GPT-4",
  "AlphaGo 一天可以自我对弈数百万局棋",
  "全球每天有超过 10 亿条 AI 生成的文本被产出"
]

Page({
  data: {
    tags: ["技术笔记", "AI探索", "开源爱好者"],
    techs: ["Next.js", "React", "TypeScript", "Tailwind"],
    quote: {},
    fact: "",
    copied: false
  },
  onLoad: function() {
    this.setData({
      quote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
      fact: FACTS[Math.floor(Math.random() * FACTS.length)]
    })
  },
  onCopy: function() {
    var that = this
    wx.setClipboardData({
      data: "attychen",
      success: function() {
        that.setData({ copied: true })
        wx.showToast({ title: "微信号已复制", icon: "success" })
        setTimeout(function() { that.setData({ copied: false }) }, 2000)
      }
    })
  }
})