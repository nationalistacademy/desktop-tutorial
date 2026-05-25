// Dynamic Table Search Filter
(function() {
  const searchInput = document.getElementById('codeSearch');
  const clearBtn = document.getElementById('clearSearch');
  const searchResults = document.getElementById('searchResults');
  const tables = document.querySelectorAll('table');
  
  if (searchInput && tables.length > 0) {
    const allRows = [];
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(r => allRows.push(r));
    });
    
    function filterTable() {
      const term = searchInput.value.toLowerCase().trim();
      let visibleCount = 0;
      
      allRows.forEach(row => {
        const matches = term === '' || row.textContent.toLowerCase().includes(term);
        row.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });
      
      if (term !== '') {
        searchResults.style.display = 'block';
        searchResults.innerHTML = `<span style="display:flex; align-items:center; gap:8px;"><svg style="width:16px; height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Found ${visibleCount} matching results for "${term}"</span>`;
        clearBtn.style.display = 'inline-block';
      } else {
        searchResults.style.display = 'none';
        clearBtn.style.display = 'none';
      }
    }
    
    searchInput.addEventListener('input', filterTable);
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterTable();
    });
  }
})();
