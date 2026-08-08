var api = require("../../utils/api")

Page({
  data: {
    posts: [],
    filteredPosts: [],
    categories: [],
    activeCategory: "",
    hasMore: false,
    loading: true,
    page: 1,
    pageSize: 10
  },
  onLoad: function() {
    this.loadPosts()
  },
  onPullDownRefresh: function() {
    this.loadPosts()
    wx.stopPullDownRefresh()
  },
  loadPosts: function() {
    var that = this
    that.setData({ loading: true })
    api.fetchPosts(function(posts) {
      var formatted = posts.map(function(p) {
        return {
          slug: p.slug || "",
          title: p.title || "Untitled",
          excerpt: p.excerpt || "",
          date: p.date || "",
          dateFormatted: api.formatDate(p.date),
          category: p.category || "",
          tags: p.tags || []
        }
      })
      var catSet = {}
      formatted.forEach(function(p) { if (p.category) catSet[p.category] = true })
      var categories = [{ name: "全部" }]
      Object.keys(catSet).forEach(function(c) { categories.push({ name: c }) })
      that.setData({
        posts: formatted,
        filteredPosts: formatted.slice(0, that.data.pageSize),
        categories: categories,
        hasMore: formatted.length > that.data.pageSize,
        loading: false
      })
    })
  },
  onCategoryTap: function(e) {
    var category = e.currentTarget.dataset.category
    var filtered = category === "全部" ? this.data.posts : this.data.posts.filter(function(p) { return p.category === category })
    this.setData({
      activeCategory: category,
      filteredPosts: filtered.slice(0, this.data.pageSize),
      hasMore: filtered.length > this.data.pageSize,
      page: 1
    })
  },
  onArticleTap: function(e) {
    var slug = e.currentTarget.dataset.slug
    wx.navigateTo({ url: "/pages/article/article?slug=" + encodeURIComponent(slug) })
  },
  onLoadMore: function() {
    var nextPage = this.data.page + 1
    var filtered = this.data.activeCategory ? this.data.posts.filter(function(p) { return p.category === this.data.activeCategory }, this) : this.data.posts
    this.setData({
      filteredPosts: filtered.slice(0, nextPage * this.data.pageSize),
      page: nextPage,
      hasMore: filtered.length > nextPage * this.data.pageSize
    })
  }
})