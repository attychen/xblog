var BASE_URL = "https://www.chatgpt.us.kg"

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
    fail() { callback([]) }
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
    fail() { callback(null) }
  })
}

function fetchModels(callback) {
  wx.request({
    url: BASE_URL + "/api/models",
    method: "GET",
    header: { "Accept": "application/json" },
    success(res) {
      if (res.statusCode === 200 && Array.isArray(res.data)) {
        callback(res.data)
      } else {
        callback([])
      }
    },
    fail() { callback([]) }
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
  return (d.getMonth() + 1) + "\u6708" + d.getDate() + "\u65e5"
}

module.exports = { fetchPosts: fetchPosts, fetchPost: fetchPost, fetchModels: fetchModels, formatNum: formatNum, formatDate: formatDate }