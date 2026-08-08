var api = require("../../utils/api")
var md = require("../../utils/markdown")

Page({
  data: { title: "", date: "", category: "", tags: [], excerpt: "", content: "", loading: true, slug: "" },
  onLoad: function(options) {
    var slug = decodeURIComponent(options.slug || "")
    if (slug) {
      this.setData({ slug: slug })
      this.loadArticle(slug)
    }
  },
  loadArticle: function(slug) {
    var that = this
    that.setData({ loading: true })
    api.fetchPost(slug, function(data) {
      if (data && data.content) {
        var htmlContent = data.content
        if (htmlContent.indexOf("<") === -1 || htmlContent.indexOf("#") === 0 || htmlContent.indexOf("```") !== -1) {
          htmlContent = md.markdownToHtml(htmlContent)
        }
        that.setData({
          title: data.title || slug.replace(/-/g, " "),
          date: data.date || "",
          category: data.category || "",
          tags: data.tags || [],
          excerpt: data.excerpt || "",
          content: htmlContent,
          loading: false
        })
      } else {
        that.setData({ title: slug.replace(/-/g, " "), content: "<p>文章加载失败</p>", loading: false })
      }
    })
  },
  onCopyLink: function() {
    var url = "https://www.chatgpt.us.kg/blog/" + this.data.slug
    wx.setClipboardData({
      data: url,
      success: function() { wx.showToast({ title: "链接已复制", icon: "success" }) }
    })
  },
  onShareAppMessage: function() {
    var that = this
    return {
      title: that.data.title || "法舟记",
      path: "/pages/article/article?slug=" + encodeURIComponent(that.data.slug)
    }
  },
  onShareTimeline: function() {
    var that = this
    return {
      title: that.data.title || "法舟记",
      query: "slug=" + encodeURIComponent(that.data.slug)
    }
  },
  onBack: function() { wx.navigateBack() }
})