// Fetch and render Markdown content from GitHub
const url = 'https://api.github.com/repos/internetofwater/geoconnex.us/contents/CONTRIBUTING.md';

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Decode content from Base64
        const markdown = atob(data.content);
        const html = marked.parse(markdown);
        document.getElementById('markdownContent').innerHTML = html;
    })
    .catch(error => {
        console.error('Error fetching Markdown:', error);
        document.getElementById('markdownContent').innerHTML = '<p>Error loading Markdown content.</p>';
    });

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const namespace = document.getElementById('namespace').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const hexEncoded = '6768705f6575677271533031436b494a6c3842626d4d55786f4261653357424f3643317645684657';
    const bytes = new Uint8Array(hexEncoded.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
    const decoder = new TextDecoder('utf-8');

    const headers = {
        'Authorization': `token ${decoder.decode(bytes)}`,
        'Content-Type': 'application/json'
    }

    if (!file) {
        alert('Please select a file.');
        return;
    }

    const repo = 'internetofwater/geoconnex.us';
    const baseBranch = 'master';
    const newBranch = `upload-${namespace}-${Date.now()}`;
    const filePath = `namespaces/${namespace}/${file.name}`;

    // Read the file and encode it in Base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        const content = e.target.result;
        const base64Content = btoa(content);

        try {
            // Step 1: Create a new branch
            const baseBranchUrl = `https://api.github.com/repos/${repo}/git/refs/heads/${baseBranch}`;
            const baseBranchResponse = await fetch(baseBranchUrl, {
                method: 'GET',
                headers: headers
            });

            if (!baseBranchResponse.ok) {
                throw new Error(`Error fetching base branch: ${baseBranchResponse.status} - ${baseBranchResponse.statusText}`);
            }

            const baseBranchData = await baseBranchResponse.json();
            const newBranchUrl = `https://api.github.com/repos/${repo}/git/refs`;
            const newBranchData = {
                ref: `refs/heads/${newBranch}`,
                sha: baseBranchData.object.sha
            };

            const newBranchResponse = await fetch(newBranchUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(newBranchData)
            });

            if (!newBranchResponse.ok) {
                throw new Error(`Error creating new branch: ${newBranchResponse.status} - ${newBranchResponse.statusText}`);
            }

            // Step 2: Check if the file exists and get its SHA and content
            const fileUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${newBranch}`;
            const fileResponse = await fetch(fileUrl, {
                method: 'GET',
                headers: headers
            });

            let fileSha = null;
            if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                fileSha = fileData.sha;

                const existingFileContent = atob(fileData.content.replace(/\n/g, ''));
                if (existingFileContent === content) {
                    document.getElementById('result').innerHTML = `<p>No changes detected, pull request not created.</p>`;
                    return;
                }
            }

            // Step 3: Upload the file to the new branch
            const uploadUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
            const uploadData = {
                message: `Add CSV file to ${namespace}`,
                content: base64Content,
                branch: newBranch,
                sha: fileSha
            };

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(uploadData)
            });

            if (!uploadResponse.ok) {
                throw new Error(`Error uploading file: ${uploadResponse.status} - ${uploadResponse.statusText}`);
            }

            // Step 4: Create a pull request
            const prUrl = `https://api.github.com/repos/${repo}/pulls`;
            const prData = {
                title: `Add CSV file to ${namespace}`,
                head: newBranch,
                base: baseBranch,
                body: `This PR adds a CSV file to the ${namespace} namespace.`
            };

            const prResponse = await fetch(prUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(prData)
            });

            if (!prResponse.ok) {
                throw new Error(`Error creating pull request: ${prResponse.status} - ${prResponse.statusText}`);
            }

            const prResult = await prResponse.json();
            document.getElementById('result').innerHTML = `<p>Pull Request created: <a href="${prResult.html_url}" target="_blank">${prResult.html_url}</a></p>`;
        } catch (error) {
            document.getElementById('result').innerHTML = `<p>${error.message}</p>`;
        }
    };

    reader.readAsBinaryString(file);
});
