var BASE_URL = "https://blog.zachchan.com"

function fetchPosts(callback) {
  wx.request({
    url: BASE_URL + "/api/posts",
    method: "GET",
    header: { "Accept": "application/json" },
    success(res) {
      if (res.statusCode === 200 && Array.isArray(res.data)) {
        callback(res.data)
      } else {
        callback([])
      }
    },
    fail() {
      callback([])
    }
  })
}

function fetchPost(slug, callback) {
  wx.request({
    url: BASE_URL + "/api/post/" + slug.replace(".html", ""),
    method: "GET",
    header: { "Accept": "application/json" },
    success(res) {
      if (res.statusCode === 200 && res.data) {
        callback(res.data)
      } else {
        callback(null)
      }
    },
    fail() {
      callback(null)
    }
  })
}

function fetchModels(callback) {
  wx.request({
    url: "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=50&filter=text-generation",
    method: "GET",
    success(res) {
      var models = (res.data || []).map(function(m) {
        return {
          id: m.id || "",
          author: m.author || "",
          likes: m.likes || 0,
          downloads: m.downloads || 0,
          pipeline_tag: m.pipeline_tag || "text-generation",
          tags: m.tags || [],
          description: m.description || ""
        }
      })
      callback(models)
    },
    fail() {
      callback([])
    }
  })
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return String(n)
}

function formatDate(dateStr) {
  if (!dateStr) return ""
  var d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return (d.getMonth() + 1) + "月" + d.getDate() + "日"
}

module.exports = { fetchPosts: fetchPosts, fetchPost: fetchPost, fetchModels: fetchModels, formatNum: formatNum, formatDate: formatDate }