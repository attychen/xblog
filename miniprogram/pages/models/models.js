var api = require("../../utils/api")

var LABELS = {
  "text-generation": "文本生成",
  "text2text-generation": "文本转换",
  "translation": "翻译",
  "summarization": "摘要",
  "conversational": "对话",
  "question-answering": "问答"
}

Page({
  data: {
    models: [],
    filtered: [],
    search: "",
    loading: true
  },
  onLoad: function() {
    this.loadModels()
  },
  onPullDownRefresh: function() {
    this.loadModels()
    wx.stopPullDownRefresh()
  },
  loadModels: function() {
    var that = this
    that.setData({ loading: true })
    api.fetchModels(function(models) {
      var formatted = models.map(function(m) {
        return {
          id: m.id || "",
          author: m.author || "",
          likes: m.likes || 0,
          downloads: m.downloads || 0,
          pipeline_tag: m.pipeline_tag || "text-generation",
          tags: m.tags || [],
          description: m.description || "",
          likesFormatted: api.formatNum(m.likes),
          downloadsFormatted: api.formatNum(m.downloads),
          category: LABELS[m.pipeline_tag] || m.pipeline_tag || "其他"
        }
      })
      that.setData({ models: formatted, filtered: formatted, loading: false })
    })
  },
  onSearch: function(e) {
    var search = e.detail.value.toLowerCase()
    var filtered = search ? this.data.models.filter(function(m) { return m.id.toLowerCase().indexOf(search) !== -1 }) : this.data.models
    this.setData({ search: search, filtered: filtered })
  },
  onModelTap: function(e) {
    var id = e.currentTarget.dataset.id
    wx.setClipboardData({
      data: "https://huggingface.co/" + id,
      success: function() { wx.showToast({ title: "链接已复制", icon: "success" }) }
    })
  }
})