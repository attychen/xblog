var api = require("../../utils/api")

Page({
  data: {
    repos: [],
    loading: true
  },
  onLoad: function() {
    this.loadRepos()
  },
  onPullDownRefresh: function() {
    this.loadRepos()
    wx.stopPullDownRefresh()
  },
  loadRepos: function() {
    var that = this
    that.setData({ loading: true })
    wx.request({
      url: "https://www.chatgpt.us.kg/api/skill",
      method: "GET",
      header: { "Accept": "application/json" },
      success(res) {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          var repos = res.data.map(function(r) {
            return {
              id: r.id, name: r.full_name || r.name, url: r.html_url,
              description: r.description || "", language: r.language || "",
              stars: api.formatNum(r.stargazers_count || 0), forks: api.formatNum(r.forks_count || 0)
            }
          })
          that.setData({ repos: repos, loading: false })
        } else {
          that.setData({ repos: [], loading: false })
        }
      },
      fail() { that.setData({ repos: [], loading: false }) }
    })
  },
  onRepoTap: function(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.url,
      success: function() { wx.showToast({ title: "链接已复制", icon: "success" }) }
    })
  }
})