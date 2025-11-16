// Blacklink Accounts Footer Component
// Dynamically renders the footer across all pages

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Blacklink Accounts</h3>
          <p>Secure authentication for all Blacklink services</p>
        </div>
        <div class="footer-section">
          <h4>Products</h4>
          <ul>
            <li><a href="https://blacklink.net/note25">Note25</a></li>
            <li><a href="https://blacklink.net/note26">Note26</a></li>
            <li><a href="https://blacklink.net/aero">Aero AI</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="about.html">About</a></li>
            <li><a href="https://blacklink.net/support">Support</a></li>
            <li><a href="https://blacklink.net/status">Status</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="https://blacklink.net/terms">Terms of Service</a></li>
            <li><a href="https://blacklink.net/cookies">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${currentYear} Blacklink Education. All rights reserved.</p>
        <p>Powered by Firebase & Google Cloud Platform</p>
      </div>
    </footer>
  `;
}

// Initialize footer
export function initFooter() {
  const footerContainer = document.getElementById('footer-container');

  if (footerContainer) {
    footerContainer.innerHTML = renderFooter();
  }
}

// Add default footer styles
export const footerStyles = `
  .footer {
    margin-top: 4rem;
    padding: 3rem 2rem 1rem;
    background: var(--card-bg);
    border-top: 2px solid var(--border);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .footer-section h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .footer-section h4 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text);
  }

  .footer-section p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
  }

  .footer-section ul li {
    margin-bottom: 0.5rem;
  }

  .footer-section ul li a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.85rem;
    transition: var(--transition);
  }

  .footer-section ul li a:hover {
    color: var(--primary);
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .footer-bottom p {
    margin: 0.25rem 0;
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
`;
