class arrow extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;

        this.style.display = 'inline-block';
        this.style.width = '20px';
        this.style.height = '20px';
        this.style.transition = 'transform 0.3s ease';

        this.addEventListener('click', () => {
            this.rotate();
        });
    }

    rotate() {
        const currentRotation = this.style.transform;
        const isRotated = currentRotation.includes('rotate(180deg)');
        this.style.transform = isRotated ? 'rotate(0deg)' : 'rotate(180deg)';
    }
}

customElements.define('arrow-component', arrow);