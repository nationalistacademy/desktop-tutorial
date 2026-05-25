import urllib.request
import urllib.error
import json

# ⚠️ SECURITY WARNING: Do not share this file with the API key visible.
# It is recommended to use environment variables for keys.
API_KEY = "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"

# OpenRouter API Endpoint
URL = "https://openrouter.ai/api/v1/chat/completions"

# Headers as per OpenRouter requirements and your AGENTS.md rules
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://assignmentwaly.blogspot.com/", # App Identifier
    "X-Title": "Assignmentwaly" # App Display Name
}

# The prompt to connect "Google Gravity" concept
# We instruct the model to generate content following the Google Gravity SEO framework
prompt = """
Write a high-authority, SEO-optimized educational post about 'AIOU Solved Assignments Spring 2026'.
Follow the 'Google Gravity' SEO framework:
1. Long-form content (deep analysis).
2. Clear heading structure (H1, H2, H3).
3. Human-centric, helpful content (no AI fluff).
4. Structured data (tables or lists).
5. Optimize for user intent (answering specific student questions).
"""

data = {
    "model": "google/gemini-2.5-flash", # You can change this to any model available on OpenRouter
    "messages": [
        {
            "role": "user",
            "content": prompt
        }
    ]
}

def connect_to_openrouter():
    print("Connecting to OpenRouter using urllib...")
    
    req = urllib.request.Request(
        URL,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print("Success!")
            result = json.loads(response.read().decode('utf-8'))
            content = result['choices'][0]['message']['content']
            print("\nGenerated Content Preview:\n")
            print(content[:500] + "...\n[Content truncated in preview]")
            
            # Save the generated content to a file
            output_file = "google_gravity_content.md"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"\nFull content saved to {output_file}")
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    connect_to_openrouter()
