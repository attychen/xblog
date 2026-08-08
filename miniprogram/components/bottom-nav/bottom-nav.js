Component({
  data: {
    tabs: [
      { path: "/pages/blog/blog", label: "\u9996\u9875" },
      { path: "/pages/skill/skill", label: "\u6280\u80fd" },
      { path: "/pages/models/models", label: "\u6a21\u578b" },
      { path: "/pages/about/about", label: "\u5173\u4e8e" }
    ],
    current: ""
  },
  lifetimes: {
    attached: function() {
      var pages = getCurrentPages()
      var current = pages[pages.length - 1]
      if (current) {
        this.setData({ current: "/" + current.route })
      }
    }
  },
  methods: {
    onTap: function(e) {
      var path = e.currentTarget.dataset.path
      wx.redirectTo({ url: path })
    }
  }
})