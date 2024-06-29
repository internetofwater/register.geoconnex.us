export async function fetchMarkdownContent(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const markdown = atob(data.content); // Decode content from Base64
    return markdown;
}

async function fetchJson(url: string, headers: HeadersInit, method: string = 'GET', body?: BodyInit): Promise<Response> {
    const options: RequestInit = {
        method: method,
        headers: headers,
        body: body
    };
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }

    return response;
}