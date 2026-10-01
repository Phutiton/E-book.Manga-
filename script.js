// คลังชื่อวิชาอัตโนมัติ
const subjects = [
    "วิศวกรรมซอฟต์แวร์",
    "ระบบฐานข้อมูล",
    "การประมวลผลผลลัพธ์และอัลกอริทึม",
    "เครือข่ายคอมพิวเตอร์",
    "สถาปัตยกรรมคอมพิวเตอร์",
    "ระบบปฏิบัติการ",
    "ความเป็นผู้ประกอบการและนวัตกรรม",
    "การออกแบบและพัฒนาเว็บ",
    "ความมั่นคงปลอดภัยไซเบอร์",
    "ปัญญาประดิษฐ์เบื้องต้น"
];

let currentTasks = [];
let chartInstance = null;

// โหลดครั้งแรกให้สุ่มโจทย์ขึ้นมาเลย 1 ชุด
window.onload = () => {
    randomizeTasks();
};

// 1. ฟังก์ชันสุ่มโจทย์ใหม่
function randomizeTasks() {
    let numTasks = Math.floor(Math.random() * 2) + 5; // สุ่ม 5 หรือ 6 งาน
    let tasks = [];

    // สลับชื่อวิชาแบบสุ่ม
    let shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());

    // สุ่ม Index ที่จะบังคับให้ AT เป็น 0 อย่างน้อย 1 งาน
    let zeroIndex = Math.floor(Math.random() * numTasks);

    for (let i = 0; i < numTasks; i++) {
        // AT สุ่ม 0-10, ถ้าเป็น zeroIndex บังคับให้เป็น 0
        let at = (i === zeroIndex) ? 0 : Math.floor(Math.random() * 11);
        // BT สุ่ม 1-8
        let bt = Math.floor(Math.random() * 8) + 1;

        tasks.push({
            id: 'P' + (i + 1),
            desc: shuffledSubjects[i % subjects.length], // ดึงชื่อวิชา
            at: at,
            bt: bt
        });
    }

    // สุ่มค่า Time Quantum (q) ระหว่าง 1-4
    document.getElementById('timeQuantum').value = Math.floor(Math.random() * 4) + 1;

    currentTasks = tasks;
    renderTaskTable();
    hideResults(); // ซ่อนหน้าต่างเฉลยไว้ก่อน
}

// 2. ฟังก์ชันเพิ่มงานด้วยตัวเอง
function addTask() {
    let newId = 'P' + (currentTasks.length + 1);
    currentTasks.push({
        id: newId,
        desc: "Custom Subject",
        at: 0,
        bt: 1
    });
    renderTaskTable();
    hideResults();
}

// 3. ฟังก์ชันลบงาน
function deleteTask(index) {
    currentTasks.splice(index, 1);
    // เรียงลำดับชื่อ P ใหม่ (P1, P2, ...)
    currentTasks.forEach((t, i) => {
        t.id = 'P' + (i + 1);
    });
    renderTaskTable();
    hideResults();
}

function clearTasks() {
    if (confirm("ต้องการล้างข้อมูลงานทั้งหมดหรือไม่?")) {
        currentTasks = [];
        renderTaskTable();
        hideResults();
    }
}

function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
}

// 4. วาดตารางโจทย์ด้านบน
function renderTaskTable() {
    const tbody = document.getElementById('taskTableBody');
    tbody.innerHTML = '';

    currentTasks.forEach((task, index) => {
        const tr = document.createElement('tr');

        let colorClass = 'p-bg-' + ((index % 8) + 1);

        tr.innerHTML = `
            <td>
                <div class="process-badge ${colorClass}">${task.id}</div>
            </td>
            <td>
                <input type="text" class="table-input text-left" value="${task.desc}" onchange="updateTask(${index}, 'desc', this.value)">
            </td>
            <td>
                <input type="number" class="table-input fw-bold text-primary" min="0" value="${task.at}" onchange="updateTask(${index}, 'at', this.value)">
            </td>
            <td>
                <input type="number" class="table-input fw-bold text-danger" min="1" value="${task.bt}" onchange="updateTask(${index}, 'bt', this.value)">
            </td>
            <td>
                <button class="btn-delete" onclick="deleteTask(${index})">
                    <i class="fas fa-trash-alt"></i><br><span style="font-size:0.7rem; font-weight:bold;">ลบ</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// อัปเดต State เมื่อผู้ใช้พิมพ์แก้ไขในช่อง Input
function updateTask(index, field, value) {
    if (field === 'at' || field === 'bt') {
        value = parseInt(value) || 0;
        if (field === 'bt' && value < 1) value = 1;
        if (field === 'at' && value < 0) value = 0;
    }
    currentTasks[index][field] = value;
    hideResults(); // ข้อมูลเปลี่ยน ให้ซ่อนเฉลย
}

// 5. ระบบบันทึก (Seed) เป็นตัวเลข (Format: Q-AT1-BT1-AT2-BT2-...)
function exportSeed() {
    let q = document.getElementById('timeQuantum').value;
    let parts = [q];
    currentTasks.forEach(task => {
        parts.push(task.at);
        parts.push(task.bt);
    });
    let seedStr = parts.join('-');
    document.getElementById('seedInput').value = seedStr;
    alert("Export ข้อมูลสำเร็จ! คุณสามารถคัดลอกตัวเลข Seed นี้เก็บไว้ได้");
}

function importSeed() {
    let seedStr = document.getElementById('seedInput').value.trim();
    if (!seedStr) {
        alert("กรุณาวาง Seed Code ก่อน");
        return;
    }

    // ตรวจสอบรูปแบบตัวเลข (คั่นด้วย - หรือ , หรือ เว้นวรรค)
    let parts = seedStr.split(/[-,\s]+/).map(item => item.trim()).filter(item => item !== '');

    if (parts.length < 3 || parts.length % 2 === 0) {
        alert("❌ รูปแบบ Seed ไม่ถูกต้อง! ต้องขึ้นต้นด้วยค่า q และตามด้วยคู่ตัวเลข (AT, BT) เช่น 2-0-4-1-3-2-1");
        return;
    }

    let q = parseInt(parts[0]);
    if (isNaN(q) || q < 1 || q > 4) {
        alert("❌ ค่า Time Quantum (q) ใน Seed ต้องอยู่ระหว่าง 1-4");
        return;
    }

    let tasks = [];
    let pIdx = 1;
    let shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());

    for (let i = 1; i < parts.length; i += 2) {
        let at = parseInt(parts[i]);
        let bt = parseInt(parts[i + 1]);

        if (isNaN(at) || isNaN(bt) || at < 0 || bt < 1) {
            alert("❌ ข้อมูลตัวเลข AT/BT ใน Seed ไม่ถูกต้อง (AT >= 0, BT >= 1)");
            return;
        }

        tasks.push({
            id: 'P' + pIdx,
            desc: shuffledSubjects[(pIdx - 1) % subjects.length] || ("Process " + pIdx),
            at: at,
            bt: bt
        });
        pIdx++;
    }

    currentTasks = tasks;
    document.getElementById('timeQuantum').value = q;
    renderTaskTable();
    hideResults();
    alert("📥 โหลดโจทย์เรียบร้อยแล้ว!");
}

// 6. กดคำนวณและแสดงผลลัพธ์
function calculateAll() {
    // 6.1 Input Validation สำหรับค่า Time Quantum (q)
    let qInput = document.getElementById('timeQuantum');
    let q = parseInt(qInput.value);

    // ตรวจสอบว่าไม่อยู่ในช่วง 1-4
    if (isNaN(q) || q < 1 || q > 4) {
        alert('❌ ผิดพลาด: กรุณากำหนด Time Quantum (q) ให้อยู่ในช่วง 1-4 เท่านั้น!');
        qInput.focus(); // เด้งไปให้แก้
        return;
    }

    if (currentTasks.length === 0) {
        alert('❌ โปรดเพิ่มงานอย่างน้อย 1 งาน');
        return;
    }

    // เช็คว่ามี AT = 0 อย่างน้อย 1 งานหรือไม่
    let hasZeroAT = false;
    for (let t of currentTasks) {
        if (t.at === 0) hasZeroAT = true;
    }
    if (!hasZeroAT) {
        alert('⚠️ ข้อกำหนด: ต้องมีงานอย่างน้อยหนึ่งงานที่มี Arrival Time (AT) = 0 โปรดแก้ไข!');
        return; // บังคับให้แก้
    }

    // 6.2 คำนวณ (ใช้ Data ชุดเดียวกันในการเปรียบเทียบ)
    let fcfs = calculateFCFS(currentTasks);
    let rr = calculateRR(currentTasks, q);

    // 6.3 วาดผลลัพธ์ลงหน้าจอ
    renderAlgResult('FCFS', fcfs);
    document.getElementById('rrQTitle').innerText = `q=${q}`;
    renderAlgResult('RR', rr);

    // 6.4 แสดง Section เฉลย
    document.getElementById('resultsSection').style.display = 'block';

    // เลื่อนจอไปหาเฉลย
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 6.5 วาดกราฟเปรียบเทียบและสรุปผล
    renderChart(fcfs.avgWt, rr.avgWt, q);
}



// 1. อัลกอริทึม FCFS
function calculateFCFS(tasks) {
    let arr = JSON.parse(JSON.stringify(tasks));
    arr.sort((a, b) => a.at - b.at); // เรียงตาม Arrival

    let time = 0;
    let gantt = [];
    let totTat = 0, totWt = 0;

    arr.forEach(t => {
        if (time < t.at) {
            gantt.push({ name: 'Idle', start: time, end: t.at, isIdle: true });
            time = t.at;
        }
        let start = time;
        time += t.bt;
        gantt.push({ name: t.id, start: start, end: time, isIdle: false });

        t.ct = time;
        t.tat = t.ct - t.at;
        t.wt = t.tat - t.bt;
        totTat += t.tat;
        totWt += t.wt;
    });

    arr.sort((a, b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1))); // เรียงกลับไปเป็น P1, P2
    return { results: arr, gantt: gantt, avgTat: (totTat / arr.length).toFixed(2), avgWt: (totWt / arr.length).toFixed(2) };
}

// 2. อัลกอริทึม Round Robin
function calculateRR(tasks, q) {
    let arr = JSON.parse(JSON.stringify(tasks));
    let n = arr.length;
    let remBt = arr.map(t => t.bt);

    let time = 0, completed = 0;
    let queue = [], gantt = [];
    let isAdded = new Array(n).fill(false);

    // เรียงตาม AT เป็นตัวตั้งต้น
    let sortedIndices = arr.map((t, i) => i).sort((a, b) => arr[a].at - arr[b].at);

    if (n > 0) time = arr[sortedIndices[0]].at;

    // ดึงงานแรกลงคิว
    sortedIndices.forEach(i => {
        if (arr[i].at <= time && !isAdded[i]) {
            queue.push(i);
            isAdded[i] = true;
        }
    });

    while (completed < n) {
        if (queue.length === 0) {
            let nextIndex = sortedIndices.find(i => !isAdded[i]);
            if (nextIndex !== undefined) {
                let nextTime = arr[nextIndex].at;
                gantt.push({ name: 'Idle', start: time, end: nextTime, isIdle: true });
                time = nextTime;
                sortedIndices.forEach(i => {
                    if (arr[i].at <= time && !isAdded[i]) {
                        queue.push(i);
                        isAdded[i] = true;
                    }
                });
            }
        } else {
            let current = queue.shift();
            let exec = Math.min(q, remBt[current]);
            let start = time;
            time += exec;
            remBt[current] -= exec;

            gantt.push({ name: arr[current].id, start: start, end: time, isIdle: false });

            // "นำงานใหม่เข้าคิวก่อนนำงานเดิมกลับไปต่อท้าย" (ตรงตามเอกสาร)
            sortedIndices.forEach(i => {
                if (arr[i].at > start && arr[i].at <= time && !isAdded[i]) {
                    queue.push(i);
                    isAdded[i] = true;
                }
            });

            if (remBt[current] === 0) {
                arr[current].ct = time;
                completed++;
            } else {
                queue.push(current);
            }
        }
    }

    let totTat = 0, totWt = 0;
    arr.forEach(t => {
        t.tat = t.ct - t.at;
        t.wt = t.tat - t.bt;
        totTat += t.tat;
        totWt += t.wt;
    });

    return { results: arr, gantt: gantt, avgTat: (totTat / n).toFixed(2), avgWt: (totWt / n).toFixed(2) };
}

// ==========================================
// การแสดงผล DOM
// ==========================================
function renderAlgResult(alg, data) {
    // 1. วาด Gantt Chart
    const gDiv = document.getElementById(`gantt${alg}`);
    gDiv.innerHTML = '';
    data.gantt.forEach((b, i) => {
        let div = document.createElement('div');
        div.className = 'gantt-block' + (b.isIdle ? ' idle' : '');

        if (!b.isIdle) {
            let pNum = parseInt(b.name.substring(1));
            div.classList.add('p-bg-' + (((pNum - 1) % 8) + 1));
        }

        let duration = b.end - b.start;
        div.style.flexGrow = duration;
        div.style.minWidth = Math.max(45, duration * 15) + 'px';

        let showStart = i === 0 || data.gantt[i - 1].end !== b.start;
        div.innerHTML = `
            ${b.name}
            ${showStart ? `<span class="gantt-time-start">${b.start}</span>` : ''}
            <span class="gantt-time-end">${b.end}</span>
        `;
        gDiv.appendChild(div);
    });

    // 2. เติมข้อมูลตาราง
    const tbody = document.querySelector(`#table${alg} tbody`);
    tbody.innerHTML = '';
    data.results.forEach(t => {
        tbody.innerHTML += `<tr>
            <td class="fw-bold">${t.id}</td>
            <td>${t.at}</td>
            <td>${t.bt}</td>
            <td class="text-primary fw-bold">${t.ct}</td>
            <td class="text-primary">${t.tat}</td>
            <td class="text-danger fw-bold">${t.wt}</td>
        </tr>`;
    });

    // 3. ใส่ค่าเฉลี่ย
    document.getElementById(`avgTat${alg}`).innerText = data.avgTat;
    document.getElementById(`avgWt${alg}`).innerText = data.avgWt;
}

// 4. วาดกราฟแท่งด้วย Chart.js และสร้างคำอธิบายสรุป
function renderChart(wtFcfs, wtRr, q) {
    const wtFcfsNum = parseFloat(wtFcfs);
    const wtRrNum = parseFloat(wtRr);

    // อัปเดตการ์ดตัวเลขสรุป
    document.getElementById('compWtFCFS').innerText = wtFcfsNum.toFixed(2);
    document.getElementById('compWtRR').innerText = wtRrNum.toFixed(2);
    document.getElementById('compRrQ').innerText = `q=${q}`;

    const cardFcfs = document.getElementById('cardFcfs');
    const cardRr = document.getElementById('cardRr');
    const badgeFcfs = document.getElementById('badgeFcfs');
    const badgeRr = document.getElementById('badgeRr');

    cardFcfs.classList.remove('winner');
    cardRr.classList.remove('winner');
    badgeFcfs.className = 'stat-badge badge-normal';
    badgeRr.className = 'stat-badge badge-normal';

    let winnerText = "";
    let diff = Math.abs(wtFcfsNum - wtRrNum).toFixed(2);

    if (wtFcfsNum < wtRrNum) {
        cardFcfs.classList.add('winner');
        badgeFcfs.className = 'stat-badge badge-winner';
        badgeFcfs.innerHTML = '<i class="fas fa-check-circle"></i> รอน้อยกว่า (มีประสิทธิภาพดีกว่าในชุดนี้)';
        badgeRr.innerText = `รอนานกว่า +${diff} หน่วย`;
        winnerText = `ในโจทย์ชุดนี้ <strong>FCFS มีเวลารอคอยเฉลี่ย (WT) น้อยกว่า Round Robin อยู่ ${diff} หน่วยเวลา</strong>`;
    } else if (wtRrNum < wtFcfsNum) {
        cardRr.classList.add('winner');
        badgeRr.className = 'stat-badge badge-winner';
        badgeRr.innerHTML = '<i class="fas fa-check-circle"></i> รอน้อยกว่า (มีประสิทธิภาพดีกว่าในชุดนี้)';
        badgeFcfs.innerText = `รอนานกว่า +${diff} หน่วย`;
        winnerText = `ในโจทย์ชุดนี้ <strong>Round Robin (q=${q}) มีเวลารอคอยเฉลี่ย (WT) น้อยกว่า FCFS อยู่ ${diff} หน่วยเวลา</strong>`;
    } else {
        badgeFcfs.innerText = 'เวลารอคอยเฉลี่ยเท่ากัน';
        badgeRr.innerText = 'เวลารอคอยเฉลี่ยเท่ากัน';
        winnerText = `ในโจทย์ชุดนี้ <strong>ทั้งสองอัลกอริทึมมีเวลารอคอยเฉลี่ยเท่ากันพอดี (${wtFcfsNum.toFixed(2)} หน่วยเวลา)</strong>`;
    }

    // สร้างคำอธิบายใต้แผนภูมิ
    const analysisContent = document.getElementById('analysisContent');
    analysisContent.innerHTML = `
        <p>
            📌 <strong>สรุปผลการเปรียบเทียบ:</strong> ${winnerText}
            (FCFS = <span class="highlight-text">${wtFcfsNum.toFixed(2)}</span> หน่วย, 
            Round Robin = <span class="highlight-text">${wtRrNum.toFixed(2)}</span> หน่วย)
        </p>
        <p>
            💡 <strong>หลักการทำความเข้าใจ:</strong>
        </p>
        <ul style="padding-left: 20px; margin-bottom: 10px;">
            <li style="margin-bottom: 6px;">
                <strong>First-Come, First-Served (FCFS):</strong> จัดคิวตามลำดับงานที่มาก่อน เหมาะกับงานที่ไม่เน้นสลับบ่อย แต่หากงานแรกใช้เวลาประมวลผลนาน (Burst Time สูง) จะทำให้งานด้านหลังต้องรอนานเกิดปัญหา <em>Convoy Effect</em>
            </li>
            <li>
                <strong>Round Robin (RR, q=${q}):</strong> กระจายเวลาให้ทุก Process สลับกันทำงานคนละไม่เกิน ${q} หน่วยเวลา ทำให้ตอบสนองงานสั้นได้รวดเร็วขึ้นและไม่มี Process ไหนถูกทิ้งให้รอนานจนเกินไป แม้ว่าในบางกรณีค่า WT รวมเฉลี่ยอาจสูงขึ้นเนื่องจากการสลับคิวทำงานไปมา
            </li>
        </ul>
        <div class="analysis-note">
            <i class="fas fa-info-circle text-primary"></i> <strong>ข้อสังเกต:</strong> อัลกอริทึมที่มี WT เฉลี่ยน้อยกว่าถือว่ามีประสิทธิภาพด้านเวลารอคอยดีกว่าสำหรับชุดข้อมูลนี้ แต่ยังขึ้นอยู่กับขนาดของ Time Quantum และการกระจายตัวของ Burst Time ในแต่ละโจทย์ด้วย
        </div>
    `;

    // วาดกราฟ Chart.js
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['FCFS', `Round Robin (q=${q})`],
            datasets: [{
                label: 'Average Waiting Time (น้อยกว่า = มีประสิทธิภาพดีกว่า)',
                data: [wtFcfsNum, wtRrNum],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.75)', // แดง FCFS
                    'rgba(16, 185, 129, 0.75)'  // เขียว RR
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(16, 185, 129)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` WT เฉลี่ย: ${context.parsed.y} หน่วยเวลา`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'เวลาเฉลี่ย (หน่วย)' }
                }
            }
        }
    });
}
