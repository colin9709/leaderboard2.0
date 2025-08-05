// 小组数据结构
class Team {
    constructor(name, score = 0) {
        this.name = name;
        this.score = score;
    }
}

// 积分争霸榜应用
class ScoreLeaderboard {
    constructor() {
        this.teams = [];
        this.loadTeams();
        this.initElements();
        this.initEventListeners();
        this.render();
    }

    // 初始化DOM元素
    initElements() {
        this.rankingList = document.getElementById('rankingList');
        this.teamNameInput = document.getElementById('teamName');
        this.addTeamBtn = document.getElementById('addTeam');
        this.teamSelect = document.getElementById('teamSelect');
        this.removeTeamBtn = document.getElementById('removeTeam');
        this.decreaseScoreBtn = document.getElementById('decreaseScore');
        this.increaseScoreBtn = document.getElementById('increaseScore');
        this.scoreValueInput = document.getElementById('scoreValue');
        this.teamInfo = document.getElementById('teamInfo');
        // 结算相关元素
        this.settlementBtn = document.getElementById('settlementBtn');
        this.settlementModal = document.getElementById('settlementModal');
        this.closeModal = document.getElementById('closeModal');
        this.winnerList = document.getElementById('winnerList');
    }

    // 初始化事件监听器
    initEventListeners() {
        this.addTeamBtn.addEventListener('click', () => this.addTeam());
        this.removeTeamBtn.addEventListener('click', () => this.removeTeam());
        this.decreaseScoreBtn.addEventListener('click', () => this.adjustScore(false));
        this.increaseScoreBtn.addEventListener('click', () => this.adjustScore(true));
        
        // 回车添加小组
        this.teamNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTeam();
            }
        });
        
        // 小组选择变更事件
        this.teamSelect.addEventListener('change', () => {
            this.renderTeamInfo();
        });
        
        // 结算按钮事件
        if (this.settlementBtn) {
            this.settlementBtn.addEventListener('click', () => this.showSettlement());
        }
        
        // 关闭浮窗事件
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => {
                this.settlementModal.style.display = 'none';
            });
        }
        
        // 点击浮窗外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.settlementModal) {
                this.settlementModal.style.display = 'none';
            }
        });
    }
    
    // 加载小组数据
    loadTeams() {
        const savedTeams = localStorage.getItem('scoreLeaderboardTeams');
        if (savedTeams) {
            const teamsData = JSON.parse(savedTeams);
            this.teams = teamsData.map(team => new Team(team.name, team.score));
        } else {
            // 初始化默认小组
            this.teams = [
                new Team('开发一组', 100),
                new Team('测试二组', 95),
                new Team('设计三组', 90),
                new Team('产品四组', 85),
                new Team('运维五组', 80)
            ];
            this.saveTeams();
        }
    }

    // 保存小组数据
    saveTeams() {
        localStorage.setItem('scoreLeaderboardTeams', JSON.stringify(this.teams));
    }

    // 添加小组
    addTeam() {
        const name = this.teamNameInput.value.trim();
        if (!name) {
            alert('请输入小组名称');
            return;
        }

        // 检查是否已存在同名小组
        if (this.teams.some(team => team.name === name)) {
            alert('小组名称已存在');
            return;
        }

        this.teams.push(new Team(name));
        this.teamNameInput.value = '';
        this.saveTeams();
        this.render();
    }

    // 删除小组
    removeTeam() {
        const selectedIndex = this.teamSelect.selectedIndex;
        if (selectedIndex <= 0) {
            alert('请选择要删除的小组');
            return;
        }

        // 获取选中的小组名称（去除分数部分）
        const selectedText = this.teamSelect.options[selectedIndex].text;
        const teamName = selectedText.split(' (')[0];
        
        if (confirm(`确定要删除小组 "${teamName}" 吗？`)) {
            this.teams = this.teams.filter(team => team.name !== teamName);
            this.saveTeams();
            this.render();
        }
    }

    // 调整积分
    adjustScore(isIncrease) {
        const selectedIndex = this.teamSelect.selectedIndex;
        if (selectedIndex <= 0) {
            alert('请选择一个小组');
            return;
        }

        const scoreValue = parseInt(this.scoreValueInput.value);
        if (isNaN(scoreValue) || scoreValue <= 0) {
            alert('请输入有效的分数');
            return;
        }

        // 获取选中的小组名称（去除分数部分）
        const selectedText = this.teamSelect.options[selectedIndex].text;
        const teamName = selectedText.split(' (')[0];
        const team = this.teams.find(team => team.name === teamName);
        
        if (team) {
            if (isIncrease) {
                team.score += scoreValue;
            } else {
                team.score -= scoreValue;
                // 确保分数不为负数
                if (team.score < 0) team.score = 0;
            }
            
            this.saveTeams();
            this.render();
        }
    }

    // 渲染排行榜
    renderRanking() {
        // 按分数排序
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        
        this.rankingList.innerHTML = '';
        
        sortedTeams.forEach((team, index) => {
            const rank = index + 1;
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            
            // 添加排名样式类
            if (rank === 1) rankingItem.classList.add('first');
            if (rank === 2) rankingItem.classList.add('second');
            if (rank === 3) rankingItem.classList.add('third');
            
            rankingItem.innerHTML = `
                <div class="rank ${rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : ''}">
                    ${rank}
                </div>
                <div class="team-name">${team.name}</div>
                <div class="team-score">${team.score} 分</div>
            `;
            
            this.rankingList.appendChild(rankingItem);
        });
    }

    // 渲染小组选择下拉框
    renderTeamSelect() {
        // 保存当前选中项的小组名称
        let selectedTeamName = null;
        if (this.teamSelect.selectedIndex > 0) {
            const selectedText = this.teamSelect.options[this.teamSelect.selectedIndex].text;
            selectedTeamName = selectedText.split(' (')[0];
        }
        
        this.teamSelect.innerHTML = '<option value="">请选择小组</option>';
        
        // 按分数排序
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        
        sortedTeams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = `${team.name} (${team.score}分)`;
            this.teamSelect.appendChild(option);
        });
        
        // 恢复选中项
        if (selectedTeamName) {
            for (let i = 0; i < this.teamSelect.options.length; i++) {
                const optionText = this.teamSelect.options[i].text;
                const optionTeamName = optionText.split(' (')[0];
                if (optionTeamName === selectedTeamName) {
                    this.teamSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // 渲染小组信息
    renderTeamInfo() {
        const selectedIndex = this.teamSelect.selectedIndex;
        if (selectedIndex <= 0) {
            // 使用紧凑的HTML结构，确保居中对齐
            this.teamInfo.innerHTML = '<div><p>请选择一个小组</p></div>';
            return;
        }

        const selectedText = this.teamSelect.options[selectedIndex].text;
        const teamName = selectedText.split(' (')[0];
        const team = this.teams.find(t => t.name === teamName);
        
        if (team) {
            // 使用紧凑的HTML结构，确保居中对齐
            this.teamInfo.innerHTML = '<div><h3>'+team.name+'</h3><p>当前积分: '+team.score+' 分</p></div>';
        }
    }

    // 显示结算结果
    showSettlement() {
        // 按分数排序，获取前三名
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        const topThree = sortedTeams.slice(0, 3);
        
        // 清空并填充获奖列表
        this.winnerList.innerHTML = '';
        
        topThree.forEach((team, index) => {
            const rank = index + 1;
            const winnerItem = document.createElement('div');
            winnerItem.style.display = 'flex';
            winnerItem.style.alignItems = 'center';
            winnerItem.style.padding = '15px';
            winnerItem.style.background = 'rgba(255, 255, 255, 0.2)';
            winnerItem.style.borderRadius = '10px';
            winnerItem.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            winnerItem.style.position = 'relative';
            winnerItem.style.overflow = 'hidden';
            
            // 添加排名样式（与排行榜前三名配色保持一致）
            if (rank === 1) {
                winnerItem.style.background = 'rgba(255, 215, 0, 0.9)'; // 纯正金色背景，90%不透明度
                winnerItem.style.border = '1px solid rgba(255, 215, 0, 1)'; // 纯正金色边框，100%不透明度
            } else if (rank === 2) {
                winnerItem.style.background = 'rgba(192, 192, 192, 0.9)'; // 纯正银色背景，90%不透明度
                winnerItem.style.border = '1px solid rgba(192, 192, 192, 1)'; // 纯正银色边框，100%不透明度
            } else if (rank === 3) {
                winnerItem.style.background = 'rgba(205, 127, 50, 0.9)'; // 纯正铜色背景，90%不透明度
                winnerItem.style.border = '1px solid rgba(205, 127, 50, 1)'; // 纯正铜色边框，100%不透明度
            }
            
            // 添加文字颜色样式
            let textColor = 'white'; // 默认前三名文字颜色为白色
            if (rank > 3) {
                textColor = '#007BA7'; // 第四名及以后文字颜色为湖蓝色
            }
            
            winnerItem.innerHTML = `
                <div style="font-size: 1.5rem; font-weight: bold; width: 50px; text-align: center; color: ${textColor};">${rank}</div>
                <div style="flex: 1; font-size: 1.3rem; font-weight: bold; padding: 0 15px; color: ${textColor};">${team.name}</div>
                <div style="font-size: 1rem; font-weight: bold; background: rgba(255, 255, 255, 0.3); padding: 5px 15px; border-radius: 20px; color: ${textColor};">${team.score} 分</div>
            `;
            
            this.winnerList.appendChild(winnerItem);
        });
        
        // 显示浮窗
        this.settlementModal.style.display = 'block';
        
        // 创建礼花动画
        this.createConfetti();
    }
    
    // 创建礼花动画
    createConfetti() {
        // 清除之前的礼花
        const existingConfetti = document.querySelectorAll('.confetti');
        existingConfetti.forEach(c => c.remove());
        
        // 创建新的礼花
        const colors = ['#FFD700', '#FF4500', '#00F2A7', '#4A35F0', '#FF69B4', '#1E90FF'];
        const confettiCount = 150;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.opacity = '1';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            document.body.appendChild(confetti);
            
            // 添加动画
            const animation = confetti.animate([
                { 
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 1
                },
                { 
                    transform: `translate(${Math.random() * 100 - 50}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`,
                    opacity: 0
                }
            ], {
                duration: Math.random() * 6000 + 6000, // 调整为6-12秒，进一步放慢动画
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)' // 调整缓动函数，使开始更慢
            });
            
            // 动画结束后移除元素
            animation.onfinish = () => {
                confetti.remove();
            };
        }
    }

    // 渲染整个界面
    render() {
        this.renderRanking();
        this.renderTeamSelect();
        this.renderTeamInfo();
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ScoreLeaderboard();
});