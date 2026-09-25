cask "oh-my-marktext" do
  version "0.20.0-omm.4"
  sha256 "337dbf94b137c2a857b67d6fb91e7e5553c1ce0d5aade89922c747b733f4a953"

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
