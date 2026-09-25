cask "oh-my-marktext" do
  version "0.20.0-omm.3"
  sha256 "bea5e0db900e49e3f55f8034e1011351b7559ab3e63e1ae70d0650cf163270fd"

  url "https://github.com/peterjthomson/marktext/releases/download/v#{version}/oh-my-marktext-mac-arm64-#{version}.dmg"
  name "Oh My Marktext"
  desc "Markdown editor with live preview and formatting-preserving saves"
  homepage "https://github.com/peterjthomson/marktext"

  depends_on arch: :arm64
  depends_on macos: :monterey

  app "Oh My Marktext.app"

  zap trash: [
    "~/Library/Application Support/Oh My Marktext",
    "~/Library/Preferences/com.peterjthomson.ohmy-marktext.plist",
    "~/Library/Saved Application State/com.peterjthomson.ohmy-marktext.savedState",
  ]
end
