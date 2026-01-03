config.load_autoconfig()
c.url.default_page = "https://kagi.com/"
c.url.start_pages = ["https://kagi.com/"]
c.url.searchengines = {
    "DEFAULT": "https://kagi.com/search?q={}",
    "!a": "https://www.amazon.com/s?k={}",
    "!d": "https://duckduckgo.com/?ia=web&q={}",
    "!yt": "https://www.youtube.com/results?search_query={}",
}
c.editor.command = ["kitty", "nvim", "{file}"]
c.fonts.default_family = ["Hack Nerd Font Mono"]
config.bind(
    "<Escape>", "mode-leave ;; jseval -q document.activeElement.blur()", mode="insert"
)
