# Wishlist

A Next.js website with a white and light brown wishlist theme.

## Open the website

Double-click `start-wishlist.bat`.

Or run this command in PowerShell from this folder:

```powershell
npm.cmd run dev -- --hostname localhost --port 3000
```

Then open:

```text
http://localhost:3000
```

Keep the terminal window open while using the website. Closing it stops the site.

## Product categorization

Scraped products are categorized automatically after extraction. Add these values to
`.env.local` to use Azure OpenAI:

```text
AZURE_OPENAI_CHAT_COMPLETIONS_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2025-01-01-preview
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
```

If Azure OpenAI is not configured or the request fails, the app falls back to a
local keyword classifier.

## Virtual try on

The `Try on model` action sends the uploaded model image and the saved scraped
product image to an Azure OpenAI image editing deployment. Add an image edits URL
for your deployed image model:

```text
AZURE_OPENAI_IMAGE_EDITS_URL=https://your-resource.openai.azure.com/openai/deployments/your-image-deployment/images/edits?api-version=2025-04-01-preview
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
```

The product page link is not sent to Azure for try-on. The server downloads the
saved scraped product image and sends that image file as the clothing reference.
