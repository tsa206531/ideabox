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

    const listTitles = {
      ideabox: "想法收集箱",
      urgent: "緊急任務",
      important: "重要任務",
      done: "已完成"
    };

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
        lists.value.done = [];
        
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

    const handleTaskToggle = async (task, currentList) => {
      await nextTick();
      
      if (task.done && currentList !== 'done') {
        // Move completed task to done list
        const taskIndex = lists.value[currentList].indexOf(task);
        if (taskIndex > -1) {
          lists.value[currentList].splice(taskIndex, 1);
          lists.value.done.push(task);
        }
      } else if (!task.done && currentList === 'done') {
        // Move uncompleted task back to ideabox
        const taskIndex = lists.value.done.indexOf(task);
        if (taskIndex > -1) {
          lists.value.done.splice(taskIndex, 1);
          lists.value.ideabox.push(task);
        }
      }
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
              // Update task status based on destination
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
          lists.value = { ...lists.value, ...data };
        } catch (e) {
          console.log('Could not load saved data');
        }
      }
    };

    // Save data to localStorage
    const saveData = () => {
      localStorage.setItem('taskBoard', JSON.stringify(lists.value));
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
      addTask,
      clearCompleted,
      handleTaskToggle,
      setSortable,
      getEmptyStateIcon,
      getEmptyStateText
    };
  }
}).mount("#app");
