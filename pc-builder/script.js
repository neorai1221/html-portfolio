document.addEventListener('DOMContentLoaded', () => {
    const budgetInput = document.getElementById('budget');
    const amdBuildBtn = document.getElementById('amd-build');
    const intelBuildBtn = document.getElementById('intel-build');
    const specTableBody = document.querySelector('#spec-table tbody');
    const totalIsraelSpan = document.getElementById('total-israel');
    const totalEilatSpan = document.getElementById('total-eilat');
    const savingsSpan = document.getElementById('savings');
    const savingsPercentSpan = document.getElementById('savings-percent');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportImageBtn = document.getElementById('export-image');

    const DB = {
        cpu: {
            amd: [
                { name: 'AMD Ryzen 5 5500', price: 400, socket: 'AM4' },
                { name: 'AMD Ryzen 5 5600', price: 600, socket: 'AM4' },
                { name: 'AMD Ryzen 7 5700X', price: 800, socket: 'AM4' },
                { name: 'AMD Ryzen 5 7600', price: 900, socket: 'AM5' },
                { name: 'AMD Ryzen 7 7800X3D', price: 1800, socket: 'AM5' },
                { name: 'AMD Ryzen 9 7900X', price: 2200, socket: 'AM5' }
            ],
            intel: [
                { name: 'Intel Core i3-12100F', price: 400, socket: 'LGA1700' },
                { name: 'Intel Core i5-12400F', price: 650, socket: 'LGA1700' },
                { name: 'Intel Core i5-13500', price: 1000, socket: 'LGA1700' },
                { name: 'Intel Core i7-13700K', price: 1900, socket: 'LGA1700' },
                { name: 'Intel Core i9-13900K', price: 2800, socket: 'LGA1700' }
            ]
        },
        motherboard: {
            AM4: [
                { name: 'Gigabyte B550M DS3H', price: 450 },
                { name: 'ASUS TUF Gaming B550-PLUS', price: 700 }
            ],
            AM5: [
                { name: 'Gigabyte B650M Gaming X AX', price: 800 },
                { name: 'ASUS ROG STRIX B650-F GAMING', price: 1200 }
            ],
            LGA1700: [
                { name: 'ASUS PRIME H610M-E D4', price: 400 },
                { name: 'Gigabyte B760 Gaming X AX', price: 850 },
                { name: 'ASUS ROG STRIX Z790-F GAMING', price: 1800 }
            ]
        },
        gpu: [
            { name: 'NVIDIA GeForce RTX 3050 8GB', price: 1000 },
            { name: 'AMD Radeon RX 6600 8GB', price: 1100 },
            { name: 'NVIDIA GeForce RTX 4060 8GB', price: 1800 },
            { name: 'AMD Radeon RX 7700 XT 12GB', price: 2400 },
            { name: 'NVIDIA GeForce RTX 4070 SUPER 12GB', price: 3000 },
            { name: 'AMD Radeon RX 7800 XT 16GB', price: 2800 },
            { name: 'NVIDIA GeForce RTX 4080 SUPER 16GB', price: 5500 },
            { name: 'NVIDIA GeForce RTX 4090 24GB', price: 9000 }
        ],
        ram: {
            DDR4: [
                { name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', price: 250 },
                { name: 'G.Skill Ripjaws V 32GB (2x16GB) DDR4 3600MHz', price: 450 }
            ],
            DDR5: [
                { name: 'Corsair Vengeance 32GB (2x16GB) DDR5 5600MHz', price: 500 },
                { name: 'G.Skill Trident Z5 Neo 32GB (2x16GB) DDR5 6000MHz', price: 650 }
            ]
        },
        storage: [
            { name: 'Kingston NV2 1TB NVMe SSD', price: 300 },
            { name: 'Samsung 980 Pro 1TB NVMe SSD', price: 500 },
            { name: 'Crucial P5 Plus 2TB NVMe SSD', price: 650 }
        ],
        psu: [
            { name: 'Corsair CV650 650W 80+ Bronze', price: 300 },
            { name: 'SeaSonic FOCUS Plus Gold 750W 80+ Gold', price: 500 },
            { name: 'Corsair RM850x 850W 80+ Gold', price: 700 },
            { name: 'ASUS ROG Thor 1000W 80+ Platinum', price: 1200 }
        ],
        case: [
            { name: 'Antec NX292', price: 250 },
            { name: 'Corsair 4000D Airflow', price: 450 },
            { name: 'Lian Li Lancool III', price: 800 }
        ]
    };

    amdBuildBtn.addEventListener('click', () => generateSpec('amd'));
    intelBuildBtn.addEventListener('click', () => generateSpec('intel'));

    function generateSpec(brand) {
        const budget = parseInt(budgetInput.value, 10);
        if (isNaN(budget) || budget < 3500) {
            alert('אנא הזן תקציב תקין (מינימום 3500 ש"ח)');
            return;
        }

        let spec = {};
        let totalCost = 0;

        // Prioritized component selection
        const allocation = {
            gpu: 0.40,
            cpu: 0.20,
            motherboard: 0.10,
            ram: 0.07,
            storage: 0.08,
            psu: 0.08,
            case: 0.07
        };

        spec.gpu = findBestComponent(DB.gpu, budget * allocation.gpu);
        spec.cpu = findBestComponent(DB.cpu[brand], budget * allocation.cpu);

        // Ensure compatibility
        const motherboards = DB.motherboard[spec.cpu.socket];
        spec.motherboard = findBestComponent(motherboards, budget * allocation.motherboard);

        const ramType = spec.cpu.socket === 'AM5' || spec.motherboard.name.includes('B760') || spec.motherboard.name.includes('Z790') ? 'DDR5' : 'DDR4';
        spec.ram = findBestComponent(DB.ram[ramType], budget * allocation.ram);

        spec.storage = findBestComponent(DB.storage, budget * allocation.storage);
        spec.psu = findBestComponent(DB.psu, budget * allocation.psu);
        spec.case = findBestComponent(DB.case, budget * allocation.case);

        totalCost = calculateTotalCost(spec);

        // Iteratively refine the build to meet the budget
        while (totalCost > budget && totalCost > 0) {
            const overBudgetAmount = totalCost - budget;
            let downgraded = false;

            // Downgrade the most expensive component that is not the cheapest option
            const componentOrder = ['gpu', 'cpu', 'motherboard', 'ram', 'storage', 'psu', 'case'];
            for (const comp of componentOrder) {
                const currentComp = spec[comp];
                const compList = (comp === 'cpu') ? DB.cpu[brand] : (comp === 'motherboard' ? DB.motherboard[spec.cpu.socket] : (comp === 'ram' ? DB.ram[ramType] : DB[comp]));
                const currentIndex = compList.findIndex(c => c.name === currentComp.name);

                if (currentIndex > 0) { // Can be downgraded
                    spec[comp] = compList[currentIndex - 1];
                    downgraded = true;
                    break;
                }
            }

            totalCost = calculateTotalCost(spec);
            if (!downgraded) break; // No more components to downgrade
        }

        displaySpec(spec);
    }

    function findBestComponent(componentList, allocatedBudget) {
        let suitableComponents = componentList.filter(c => c.price <= allocatedBudget);
        if (suitableComponents.length > 0) {
            return suitableComponents.reduce((best, current) => (current.price > best.price ? current : best));
        }
        return componentList[0]; // Return the cheapest if none fit
    }

    function calculateTotalCost(spec) {
        return Object.values(spec).reduce((total, component) => total + component.price, 0);
    }

    function displaySpec(spec) {
        specTableBody.innerHTML = '';
        let totalIsrael = calculateTotalCost(spec);

        const components = [
            { name: 'מעבד', item: spec.cpu },
            { name: 'לוח אם', item: spec.motherboard },
            { name: 'כרטיס מסך', item: spec.gpu },
            { name: 'זיכרון RAM', item: spec.ram },
            { name: 'אחסון', item: spec.storage },
            { name: 'ספק כוח', item: spec.psu },
            { name: 'מארז', item: spec.case }
        ];

        components.forEach(comp => {
            const row = document.createElement('tr');
            const israelPrice = comp.item.price;
            const eilatPrice = Math.round(israelPrice / 1.17);

            row.innerHTML = `
                <td><strong>${comp.name}</strong></td>
                <td>${comp.item.name}</td>
                <td>${israelPrice.toLocaleString()} ₪</td>
                <td>${eilatPrice.toLocaleString()} ₪</td>
                <td>-</td>
            `;
            specTableBody.appendChild(row);
        });

        const totalEilat = Math.round(totalIsrael / 1.17);
        const savings = totalIsrael - totalEilat;
        const savingsPercent = totalIsrael > 0 ? ((savings / totalIsrael) * 100).toFixed(1) : 0;

        totalIsraelSpan.textContent = totalIsrael.toLocaleString();
        totalEilatSpan.textContent = totalEilat.toLocaleString();
        savingsSpan.textContent = savings.toLocaleString();
        savingsPercentSpan.textContent = savingsPercent;
    }

    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("PC Gaming Spec", 20, 10);
        doc.autoTable({ html: '#spec-table' });
        doc.save('pc-spec.pdf');
    });

    exportImageBtn.addEventListener('click', () => {
        html2canvas(document.querySelector("#spec-table-container")).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'pc-spec.png';
            link.click();
        });
    });
});
