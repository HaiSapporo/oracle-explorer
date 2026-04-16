document.addEventListener('DOMContentLoaded', () => {
    if (typeof DB_SCHEMA === 'undefined') {
        alert('エラー: DB_SCHEMA のデータが見つかりません。先に builder.html を実行して data.txt を作成してください。');
        return;
    }

    // --- Config ---
    const ITEMS_PER_PAGE = 30;



    // --- State ---
    let currentTable = null;
    let searchQuery = '';
    let currentPage = 1;
    let totalPages = Math.ceil(DB_SCHEMA.length / ITEMS_PER_PAGE);

    // --- DOM Elements ---
    const treeView = document.getElementById('treeView');
    const dbStats = document.getElementById('dbStats');
    const footerDbCount = document.getElementById('footerDbCount');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // Checkboxes
    const chkTable = document.getElementById('chkTable');
    const chkField = document.getElementById('chkField');
    const chkPhysical = document.getElementById('chkPhysical');
    const chkLogical = document.getElementById('chkLogical');
    const chkRemark = document.getElementById('chkRemark');
    const searchCheckboxes = [chkTable, chkField, chkPhysical, chkLogical, chkRemark];

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Navigation Tabs
    const navBrandLogo = document.getElementById('navBrandLogo');
    const navTabs = document.querySelectorAll('.nav-tab');
    const viewSections = document.querySelectorAll('.view-section');
    
    // Pagination
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const treePagination = document.getElementById('treePagination');
    
    // Views
    const emptyState = document.getElementById('emptyState');
    const tableView = document.getElementById('tableView');
    const searchResults = document.getElementById('searchResults');
    
    // Table Details
    const tvTitle = document.getElementById('tvTitle');
    const tvLogicalName = document.getElementById('tvLogicalName');
    const tvBody = document.getElementById('tvBody');
    
    // Search List
    const searchKw = document.getElementById('searchKw');
    const searchCount = document.getElementById('searchCount');
    const srList = document.getElementById('srList');

    // --- Icons ---
    const tableIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="9" x2="9" y2="21"></line></svg>`;

    // --- Initialization ---
    dbStats.textContent = `${DB_SCHEMA.length} テーブル`;
    footerDbCount.textContent = DB_SCHEMA.length;
    
    initTheme();
    renderTree();

    // --- Event Listeners ---
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        clearSearchBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
        handleSearch();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        handleSearch();
        searchInput.focus();
    });

    searchCheckboxes.forEach(chk => {
        chk.addEventListener('change', handleSearch);
    });

    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Logo Click to Home
    navBrandLogo.addEventListener('click', () => {
        if (navTabs.length > 0) {
            navTabs[0].click(); // Simulate clicking the first tab (Search)
        }
    });

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            viewSections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.style.display = 'flex';
                } else {
                    sec.style.display = 'none';
                }
            });
        });
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTree();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTree();
        }
    });

    // --- Functions ---
    
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        } else {
            // Default to dark mode is handled by HTML class
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        }
    }

    function toggleTheme() {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    }

    function renderTree() {
        // If we are searching, hide pagination and show all matches. 
        // If not searching, paginate normal DB_SCHEMA
        let listToRender = DB_SCHEMA;
        
        if (searchQuery.length > 0) {
            // When searching, we only show matching tables in the tree?
            // Actually, best to just hide the tree pagination or keep it normal.
            // keeping it normal is better so users don't lose context.
        }

        treeView.innerHTML = '';
        
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE;
        const pageData = listToRender.slice(startIdx, endIdx);

        pageData.forEach((table) => {
            const item = document.createElement('div');
            item.className = 'tree-item';
            if (currentTable && currentTable.tableName === table.tableName) {
                item.classList.add('active');
            }
            item.innerHTML = `${tableIcon} ${table.tableName}`;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                showTableView(table);
            });
            
            treeView.appendChild(item);
        });

        // Update pagination UI
        pageInfo.textContent = `${currentPage} / ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Hide pagination if 1 page
        if (totalPages <= 1) {
            treePagination.style.display = 'none';
        } else {
            treePagination.style.display = 'flex';
        }
    }

    function showTableView(table) {
        currentTable = table;
        
        // Hide others, show table view
        emptyState.style.display = 'none';
        searchResults.style.display = 'none';
        tableView.style.display = 'block';

        tvTitle.textContent = table.tableName;
        tvLogicalName.textContent = table.logicalName || '論理名なし (No logical name)';

        tvBody.innerHTML = '';
        table.columns.forEach(col => {
            const tr = document.createElement('tr');
            
            let notNullHtml = '';
            if (col.notNull.toLowerCase().includes('pk')) {
                notNullHtml = '<span class="badge pk">PK</span>';
            } else if (col.notNull.toLowerCase().includes('yes')) {
                notNullHtml = '<span class="badge not-null">NOT NULL</span>';
            }

            tr.innerHTML = `
                <td>${col.no || ''}</td>
                <td class="td-mono">${col.physicalName || ''}</td>
                <td>${col.logicalName || ''}</td>
                <td class="td-mono">${col.dataType || ''}</td>
                <td>${notNullHtml}</td>
                <td class="td-mono">${col.default || ''}</td>
                <td>${col.remark || ''}</td>
            `;
            tvBody.appendChild(tr);
        });
    }

    function createHighlight(text, query) {
        if (!text || !query) return text || '';
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return escapedText.replace(regex, '<mark>$1</mark>');
    }

    function handleSearch() {
        if (searchQuery.length === 0) {
            searchResults.style.display = 'none';
            if (currentTable) {
                emptyState.style.display = 'none';
                tableView.style.display = 'block';
            } else {
                emptyState.style.display = 'flex';
                tableView.style.display = 'none';
            }
            return;
        }

        const searchTable = chkTable.checked;
        const searchField = chkField.checked;
        const searchPhysical = chkPhysical.checked;
        const searchLogical = chkLogical.checked;
        const searchRemark = chkRemark.checked;

        if (!searchTable && !searchField) {
            emptyState.style.display = 'flex';
            tableView.style.display = 'none';
            searchResults.style.display = 'none';
            return;
        }
        
        if (!searchPhysical && !searchLogical && !searchRemark) {
            emptyState.style.display = 'flex';
            tableView.style.display = 'none';
            searchResults.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        tableView.style.display = 'none';
        searchResults.style.display = 'block';

        const q = searchQuery.toLowerCase();
        searchKw.textContent = searchQuery;
        
        let results = [];

        DB_SCHEMA.forEach(table => {
            let tableMatches = false;
            let matchingColumns = [];

            if (searchTable) {
                if (searchPhysical && table.tableName && table.tableName.toLowerCase().includes(q)) tableMatches = true;
                if (searchLogical && table.logicalName && table.logicalName.toLowerCase().includes(q)) tableMatches = true;
            }

            if (searchField) {
                table.columns.forEach(col => {
                    let colMatches = false;
                    if (searchPhysical && col.physicalName && col.physicalName.toLowerCase().includes(q)) colMatches = true;
                    if (searchLogical && col.logicalName && col.logicalName.toLowerCase().includes(q)) colMatches = true;
                    if (searchRemark && col.remark && col.remark.toLowerCase().includes(q)) colMatches = true;
                    
                    if (colMatches) {
                        matchingColumns.push(col);
                    }
                });
            }

            if (tableMatches || matchingColumns.length > 0) {
                results.push({
                    table: table,
                    tableMatches: tableMatches,
                    matchingColumns: matchingColumns
                });
            }
        });

        searchCount.textContent = results.length;
        renderSearchResults(results, searchQuery);
    }

    function renderSearchResults(results, query) {
        srList.innerHTML = '';

        if (results.length === 0) {
            srList.innerHTML = `<p style="color: var(--text-secondary);">条件に一致する結果が見つかりません。</p>`;
            return;
        }

        const searchTable = chkTable.checked;
        const searchPhysical = chkPhysical.checked;
        const searchLogical = chkLogical.checked;
        const searchRemark = chkRemark.checked;

        results.forEach(res => {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            const tName = res.tableMatches 
                ? createHighlight(res.table.tableName, query) 
                : res.table.tableName;
                
            const logName = res.tableMatches && searchLogical && res.table.logicalName
                ? createHighlight(res.table.logicalName, query)
                : res.table.logicalName;
                
            let html = `
                <div class="result-card-header">
                    ${tableIcon}
                    <div class="result-card-title">${tName} <span style="font-weight: normal; color: var(--text-muted); font-size: 0.875rem;">${logName ? '('+logName+')' : ''}</span></div>
                </div>
            `;

            if (res.tableMatches) {
                // Render full table directly inline
                html += `
                    <div class="data-table-container glass-panel" style="margin-top: 16px; cursor: default;" onclick="event.stopPropagation();">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th width="40">No.</th>
                                    <th>物理名 (Physical)</th>
                                    <th>論理名 (Logical)</th>
                                    <th width="180">データ型 (Type)</th>
                                    <th width="100">必須</th>
                                    <th width="100">デフォルト</th>
                                    <th>備考 (Remark)</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                res.table.columns.forEach(col => {
                    let notNullHtml = '';
                    if (col.notNull.toLowerCase().includes('pk')) {
                        notNullHtml = '<span class="badge pk">PK</span>';
                    } else if (col.notNull.toLowerCase().includes('yes')) {
                        notNullHtml = '<span class="badge not-null">NOT NULL</span>';
                    }
                    html += `
                        <tr>
                            <td>${col.no || ''}</td>
                            <td class="td-mono">${searchPhysical ? createHighlight(col.physicalName, query) : col.physicalName}</td>
                            <td>${searchLogical ? createHighlight(col.logicalName, query) : col.logicalName}</td>
                            <td class="td-mono">${col.dataType || ''}</td>
                            <td>${notNullHtml}</td>
                            <td class="td-mono">${col.default || ''}</td>
                            <td>${searchRemark ? createHighlight(col.remark, query) : col.remark}</td>
                        </tr>
                    `;
                });
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            } else if (res.matchingColumns.length > 0) {
                html += `<div class="result-matches">`;
                
                const limit = (!searchTable && chkField.checked) ? 100 : 5;
                const matchesToShow = res.matchingColumns.slice(0, limit);
                
                matchesToShow.forEach(col => {
                    html += `
                        <div class="match-row">
                            <div class="match-row-header">
                                <span>列 (COLUMN)</span>
                                <span>TYPE: ${col.dataType}</span>
                            </div>
                            <div class="match-row-content">
                                <span class="td-mono">${searchPhysical ? createHighlight(col.physicalName, query) : col.physicalName}</span>
                                <span style="color: var(--text-secondary);">${searchLogical ? createHighlight(col.logicalName, query) : col.logicalName}</span>
                                <span>${searchRemark ? createHighlight(col.remark, query) : col.remark}</span>
                            </div>
                        </div>
                    `;
                });

                if (res.matchingColumns.length > limit) {
                    html += `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">...他 ${res.matchingColumns.length - limit} 列が一致しました</div>`;
                }
                
                html += `</div>`;
            }

            card.innerHTML = html;
            
            card.addEventListener('click', () => {
                // To open it, we don't need to jump the tree if we page, we just show it.
                // Revert to view table directly.
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.style.display = 'none';
                
                // Optionally adjust current page of tree to contain this table
                const tableIndex = DB_SCHEMA.findIndex(t => t.tableName === res.table.tableName);
                if(tableIndex !== -1) {
                    currentPage = Math.floor(tableIndex / ITEMS_PER_PAGE) + 1;
                    renderTree();
                }

                showTableView(res.table);
            });

            srList.appendChild(card);
        });
    }
});
