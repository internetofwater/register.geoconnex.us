function submitPR(namespace: string, file: File) {

    const hexEncoded = '6768705f6575677271533031436b494a6c3842626d4d55786f4261653357424f3643317645684657';
    const bytes = new Uint8Array(hexEncoded.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16)));
    const decoder = new TextDecoder('utf-8');
    const token = decoder.decode(bytes);

    const headers = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
    };

    const repo = 'internetofwater/geoconnex.us';
    const baseBranch = 'master';
    const newBranch = `upload-${namespace}-${Date.now()}`;
    const filePath = `namespaces/${namespace}/${file.name}`;

    try {
        // Read the file and encode it in Base64
        const content = file.text().then(text => btoa(text));

        // Step 1: Create a new branch
        const baseBranchUrl = `https://api.github.com/repos/${repo}/git/refs/heads/${baseBranch}`;
        const baseBranchData = fetchJson(baseBranchUrl, headers);

        const newBranchUrl = `https://api.github.com/repos/${repo}/git/refs`;
        const newBranchData = {
            ref: `refs/heads/${newBranch}`,
            sha: baseBranchData.object.sha
        };
        const newBranchResponse = await fetchJson(newBranchUrl, headers, 'POST', JSON.stringify(newBranchData));

        // Step 2: Check if the file exists and get its SHA and content
        const fileUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${newBranch}`;
        let fileSha = null;
        const fileResponse = await fetchJson(fileUrl, headers);

        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            fileSha = fileData.sha;

            const existingFileContent = atob(fileData.content.replace(/\n/g, ''));
            if (existingFileContent === content) {
                document.getElementById('result')!.innerHTML = `<p>No changes detected, pull request not created.</p>`;
                return;
            }
        }

        // Step 3: Upload the file to the new branch
        const uploadUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const uploadData = {
            message: `Add CSV file to ${namespace}`,
            content: content,
            branch: newBranch,
            sha: fileSha
        };
        const uploadResponse = await fetchJson(uploadUrl, headers, 'PUT', JSON.stringify(uploadData));

        // Step 4: Create a pull request
        const prUrl = `https://api.github.com/repos/${repo}/pulls`;
        const prData = {
            title: `Add CSV file to ${namespace}`,
            head: newBranch,
            base: baseBranch,
            body: `This PR adds a CSV file to the ${namespace} namespace.`
        };
        const prResponse = await fetchJson(prUrl, headers, 'POST', JSON.stringify(prData));

        const prResult = await prResponse.json();
        document.getElementById('result')!.innerHTML = `<p>Pull Request created: <a href="${prResult.html_url}" target="_blank">${prResult.html_url}</a></p>`;
    } catch (error) {
        document.getElementById('result')!.innerHTML = `<p>${error.message}</p>`;
    }
};

