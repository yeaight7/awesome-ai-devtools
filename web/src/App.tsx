import { useState, useMemo } from 'react';
import toolsData from '../../data/tools.yml';
import categoriesData from '../../data/categories.yml';

interface Tool {
  slug: string;
  name: string;
  description: string;
  website_url: string;
  repo_url?: string;
  docs_url?: string;
  categories: string[];
  primary_category?: string;
  tags: string[];
  interfaces: string[];
  deployment: string;
  source_model: string;
  license: string;
  curation_status: string;
}

interface Category {
  slug: string;
  name: string;
  description: string;
}

function App() {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDeployments, setSelectedDeployments] = useState<string[]>([]);
  
  // Only show reviewed tools by default
  const tools: Tool[] = useMemo(() => toolsData.filter((t: Tool) => t.curation_status === 'reviewed'), []);
  const categories: Category[] = categoriesData;

  const sourceModels = useMemo(() => Array.from(new Set(tools.map(t => t.source_model))).sort(), [tools]);
  const deployments = useMemo(() => Array.from(new Set(tools.map(t => t.deployment))).sort(), [tools]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]);
  };

  const toggleModel = (val: string) => {
    setSelectedModels(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const toggleDeployment = (val: string) => {
    setSelectedDeployments(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchSearch = search === '' || tool.name.toLowerCase().includes(search.toLowerCase()) || tool.description.toLowerCase().includes(search.toLowerCase()) || tool.tags.some(tag => tag.includes(search.toLowerCase()));
      const matchCategory = selectedCategories.length === 0 || tool.categories.some(cat => selectedCategories.includes(cat));
      const matchModel = selectedModels.length === 0 || selectedModels.includes(tool.source_model);
      const matchDeployment = selectedDeployments.length === 0 || selectedDeployments.includes(tool.deployment);
      return matchSearch && matchCategory && matchModel && matchDeployment;
    });
  }, [tools, search, selectedCategories, selectedModels, selectedDeployments]);

  return (
    <>
      <header className="app-header animate-in" style={{ animationDelay: '0.1s' }}>
        <h1>Awesome AI Devtools</h1>
        <p>A curated, neutral, factual directory of the AI developer tools ecosystem. Explore {tools.length} reviewed tools.</p>
      </header>

      <main className="container">
        <aside className="sidebar glass animate-in" style={{ animationDelay: '0.2s', padding: '1.5rem', alignSelf: 'flex-start', position: 'sticky', top: '2rem' }}>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search tools, description, tags..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group" style={{ marginTop: '1.5rem' }}>
            <h3>Deployment</h3>
            {deployments.map(dep => (
              <label key={dep} className="filter-item">
                <input type="checkbox" checked={selectedDeployments.includes(dep)} onChange={() => toggleDeployment(dep)} />
                {dep}
              </label>
            ))}
          </div>

          <div className="filter-group" style={{ marginTop: '1.5rem' }}>
            <h3>Source Model</h3>
            {sourceModels.map(mod => (
              <label key={mod} className="filter-item">
                <input type="checkbox" checked={selectedModels.includes(mod)} onChange={() => toggleModel(mod)} />
                {mod}
              </label>
            ))}
          </div>

          <div className="filter-group" style={{ marginTop: '1.5rem' }}>
            <h3>Categories</h3>
            {categories.map(cat => (
              <label key={cat.slug} className="filter-item">
                <input type="checkbox" checked={selectedCategories.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)} />
                {cat.name}
              </label>
            ))}
          </div>
        </aside>

        <section className="catalog animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="catalog-header">
            <h2>{filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'} Found</h2>
          </div>
          
          <div className="tool-grid">
            {filteredTools.map(tool => {
              const primaryCat = categories.find(c => c.slug === tool.primary_category) || categories.find(c => tool.categories.includes(c.slug));
              return (
                <article key={tool.slug} className="tool-card glass">
                  <div className="tool-header">
                    <a href={tool.website_url} target="_blank" rel="noreferrer" className="tool-title">
                      {tool.name}
                    </a>
                    {primaryCat && (
                      <span className="badge reviewed">{primaryCat.name}</span>
                    )}
                  </div>
                  <p className="tool-desc">{tool.description}</p>
                  <div className="tool-tags">
                    {tool.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {tool.tags.length > 4 && <span className="tag">+{tool.tags.length - 4}</span>}
                  </div>
                  <div className="tool-footer">
                    {tool.website_url && <a href={tool.website_url} target="_blank" rel="noreferrer" className="tool-link">Website</a>}
                    {tool.repo_url && <a href={tool.repo_url} target="_blank" rel="noreferrer" className="tool-link">Repo</a>}
                    {tool.docs_url && <a href={tool.docs_url} target="_blank" rel="noreferrer" className="tool-link">Docs</a>}
                  </div>
                </article>
              );
            })}
          </div>
          
          {filteredTools.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }} className="glass">
              <h3>No tools found matching your filters.</h3>
              <p>Try adjusting your search or category selection.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default App;
