const { createApp, ref, nextTick } = Vue;

createApp({
  setup() {
    const newTask = ref("");
    const lists = ref({
      ideabox: [],
      urgent: [],
      important: [],
      done: []
    });

    const listTitles = ref({
      ideabox: "想法收集箱",
      urgent: "緊急任務",
      important: "重要任務",
      done: "已完成"
    });

    // 記錄哪些列表正在編輯
    const editingList = ref({});
    const tempTitle = ref("");

    // 預設列表（不能刪除）
    const defaultLists = ['ideabox', 'urgent', 'important', 'done'];

    const addTask = async () => {
      const text = newTask.value.trim();
      if (text) {
        const newTaskObj = {
          id: Date.now(),
          text,
          done: false,
          justAdded: true
        };
        
        lists.value.ideabox.push(newTaskObj);
        newTask.value = "";
        
        // Remove the justAdded flag after animation
        await nextTick();
        setTimeout(() => {
          newTaskObj.justAdded = false;
        }, 300);
        
        // Add success feedback
        const button = document.querySelector('.btn-primary');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
      }
    };

    const clearCompleted = () => {
      const completedCount = lists.value.done.length;
      if (completedCount > 0) {
        // Clear all tasks from done list
        lists.value.done.splice(0, lists.value.done.length);
        
        // Show feedback
        const button = document.querySelector('.btn-secondary');
        button.style.background = '#95e1d3';
        button.style.color = '#2c2c2c';
        setTimeout(() => {
          button.style.background = '';
          button.style.color = '';
        }, 1000);
      }
    };

    // 任務打勾不會自動移動，需要手動拖拽
    const handleTaskToggle = (task, currentList) => {
      // 只更新任務狀態，不自動移動
    };

    // 開始編輯列表標題
    const startEditTitle = async (listName) => {
      editingList.value[listName] = true;
      tempTitle.value = listTitles.value[listName];
      await nextTick();
      // 自動聚焦到輸入框
      const inputs = document.querySelectorAll('.list-title-input');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
        inputs[inputs.length - 1].select();
      }
    };

    // 完成編輯標題
    const finishEditTitle = (listName) => {
      const newTitle = tempTitle.value.trim();
      if (newTitle) {
        listTitles.value[listName] = newTitle;
      }
      editingList.value[listName] = false;
    };

    // 取消編輯標題
    const cancelEditTitle = (listName) => {
      editingList.value[listName] = false;
      tempTitle.value = "";
    };

    // 新增收集盒
    const addNewList = () => {
      const listName = `custom_${Date.now()}`;
      const listTitle = `新收集盒 ${Object.keys(lists.value).length}`;
      
      lists.value[listName] = [];
      listTitles.value[listName] = listTitle;
      editingList.value[listName] = false;
      
      // 立即編輯新的收集盒名稱
      setTimeout(() => {
        startEditTitle(listName);
      }, 100);
    };

    // 刪除收集盒
    const removeList = (listName) => {
      if (!isDefaultList(listName)) {
        const taskCount = lists.value[listName].length;
        let confirmDelete = true;
        
        if (taskCount > 0) {
          confirmDelete = confirm(`此收集盒內有 ${taskCount} 個任務，確定要刪除嗎？`);
        }
        
        if (confirmDelete) {
          delete lists.value[listName];
          delete listTitles.value[listName];
          delete editingList.value[listName];
        }
      }
    };

    // 檢查是否為預設列表
    const isDefaultList = (listName) => {
      return defaultLists.includes(listName);
    };

    const setSortable = (el, listName) => {
      if (!el) return;
      
      Sortable.create(el, {
        group: "tasks",
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        easing: "cubic-bezier(1, 0, 0, 1)",
        
        onStart(evt) {
          el.dataset.list = listName;
          document.body.style.cursor = 'grabbing';
        },
        
        onEnd(evt) {
          document.body.style.cursor = '';
        },
        
        onAdd(evt) {
          const fromListName = evt.from.dataset.list;
          const toListName = listName;
          
          // Find the moved item
          const fromList = lists.value[fromListName];
          const toList = lists.value[toListName];
          
          if (fromList && toList) {
            const movedItem = fromList.splice(evt.oldIndex, 1)[0];
            if (movedItem) {
              // 根據目標列表更新任務狀態
              if (toListName === 'done') {
                movedItem.done = true;
              } else if (fromListName === 'done') {
                movedItem.done = false;
              }
              
              toList.splice(evt.newIndex, 0, movedItem);
              
              // Add visual feedback
              setTimeout(() => {
                const movedElement = evt.item;
                if (movedElement) {
                  movedElement.style.background = '#e3f2fd';
                  setTimeout(() => {
                    movedElement.style.background = '';
                  }, 500);
                }
              }, 100);
            }
          }
        }
      });
    };

    const getEmptyStateIcon = (listName) => {
      const icons = {
        ideabox: "💭",
        urgent: "⚡",
        important: "🎯", 
        done: "🎉"
      };
      return icons[listName] || "📝";
    };

    const getEmptyStateText = (listName) => {
      const texts = {
        ideabox: "還沒有想法？開始brainstorming吧！",
        urgent: "沒有緊急任務，太好了！",
        important: "重要任務清單是空的",
        done: "還沒完成任何任務"
      };
      return texts[listName] || "空空的...";
    };

    // Load data from localStorage on startup
    const loadData = () => {
      const saved = localStorage.getItem('taskBoard');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.lists) lists.value = { ...lists.value, ...data.lists };
          if (data.listTitles) listTitles.value = { ...listTitles.value, ...data.listTitles };
        } catch (e) {
          console.log('Could not load saved data');
        }
      }
    };

    // Save data to localStorage
    const saveData = () => {
      localStorage.setItem('taskBoard', JSON.stringify({
        lists: lists.value,
        listTitles: listTitles.value
      }));
    };

    // Auto-save when lists change
    const { watchEffect } = Vue;
    watchEffect(() => {
      // Watch for changes in lists and save automatically
      saveData();
    });

    // Load data on startup
    loadData();

    return {
      newTask,
      lists,
      listTitles,
      editingList,
      tempTitle,
      addTask,
      clearCompleted,
      handleTaskToggle,
      startEditTitle,
      finishEditTitle,
      cancelEditTitle,
      addNewList,
      removeList,
      isDefaultList,
      setSortable,
      getEmptyStateIcon,
      getEmptyStateText
    };
  }
}).mount("#app");
