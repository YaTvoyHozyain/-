let sample = new Vue({
  el: '.sample',
  data: {
    guests: ['Иван', 'Кирилл', 'Вера', 'Женя', 'Саша', 'Сережа'], // имена гостей
    foods: ['Лапша', 'Картошка', 'Мясо', 'Яйца', 'Вода'], // список еды
    prices: [215, 420, 83, 116, 392], // цена еды, соответствует списку еды
    // выбранные блюда людьми
    buttFoodGuest: [[ 0, 0 ], [ 0, 2 ], [ 0, 4 ], [ 0, 5 ], [ 1, 1 ], [ 1, 3 ], [ 1, 4 ], [ 2, 0 ], [ 2, 1 ], [ 2, 2 ], [ 3, 1 ], [ 3, 3 ], [ 4, 2 ], [ 4, 3 ], [ 4, 4 ], [ 3, 2 ]],
    flagGo: 0, // флаг перехода между окнами
    flagSent: false, // флаг настроек
    selectedBuyMan: ['Иван','Вера','Вера','Саша','Кирилл'], // заказчики еды, соответствует еде
    // список людей, съевших блюдо, соответствует списку еды
    whoEatFood: [ [ 0, 2, 4, 5 ], [ 1, 3, 4 ], [ 0, 1, 2 ], [ 1, 2, 3 ], [ 2, 3 ] ],
    personButtons: {}, // список кнопок людей для блюда
    marksForPersonButtons: {}, // маркер выбора для списка кнопок людей для блюда
    finalList: [], // кто кому должен
    finalList2: [], // кому кто должен
    style: null, // флаг стилей
    isPlaying: false // флаг музыка
  },
  methods: {
    goOn(flagGo){
      if (flagGo === 0){
        this.flagGo = 0;
      }
      else if (flagGo === 1){
        this.flagGo = 1;
      }
      else if (flagGo === 2){
        this.flagGo = 2;
      }
      else if (flagGo === 3){
        this.flagGo = 3;
      }
    },
    addMember(){
      this.guests.push('');
    },
    validateFoodsText(event, index) {
      const validatedValue = event.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s\-]/g, '');
      this.$set(this.foods, index, validatedValue);
    },
    validateText(event, index) {
      const validatedValue = event.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s\-]/g, '');
      this.$set(this.guests, index, validatedValue);
    },
    validateNumber(event, index) {
      const validatedValue = event.target.value.replace(/[^0-9]/g, '');
      this.$set(this.prices, index, validatedValue);
    },
    delGuest(index){
      this.guests.splice(index, 1);
      this.marksForPersonButtons[index] = true;
    },
    addFood(){
      this.foods.push('');
      this.prices.push('');
    },
    delFood(index){
      // Удаляем еду и её цену
      this.foods.splice(index, 1);
      this.prices.splice(index, 1);

      // Удаляем кнопки, связанные с этим блюдом
      delete this.personButtons[index];

      // Удаляем все записи о связях buttFoodGuest, которые относятся к удаляемому блюду
      this.buttFoodGuest = this.buttFoodGuest.filter(item => item[0] !== index);

      // Пересчитываем индексы в buttFoodGuest для блюд, которые шли после удаленного
      for (let i = 0; i < this.buttFoodGuest.length; i++) {
        if (this.buttFoodGuest[i][0] > index) {
          this.buttFoodGuest[i][0]--;  // Смещаем индекс на единицу
        }
      }

      // Удаляем связи whoEatFood для удаленного блюда
      this.whoEatFood.splice(index, 1);
      this.whoEatFood = this.whoEatFood.filter(item => item !== null && item.length > 0);
      // Пересчитываем связи whoEatFood для блюд, которые шли после удаленного
      for (let i = index; i < this.whoEatFood.length; i++) {
        // Здесь индексы автоматически смещаются после splice, не нужно дополнительно менять индексы.
      }

      // Обновляем массив с кнопками выбора персон
      let updatedPersonButtons = {};
      for (let key in this.personButtons) {
        if (key > index) {
          updatedPersonButtons[key - 1] = this.personButtons[key];
        } else if (key < index) {
          updatedPersonButtons[key] = this.personButtons[key];
        }
      }
      this.personButtons = updatedPersonButtons;

      // После удаления пересчитываем список гостей, съевших блюда
      this.addButtFoodGuest();

    },
    addPersonButtons(index){
      this.personButtons = { ...this.personButtons, [index]: true };
      this.marksForPersonButtons[index] = !this.marksForPersonButtons[index];
    },
    addButtFoodGuest(indexFood, indexGuest){
      let flag = true;
      if (this.buttFoodGuest != {}){
        for (let i = 0; i < this.buttFoodGuest.length; i++) {
          if ((this.buttFoodGuest[i][0] == indexFood) && (this.buttFoodGuest[i][1] == indexGuest)){
            flag = false;
            this.buttFoodGuest.splice(i, 1);
          }
        }
      }
      if (flag) {this.buttFoodGuest.push([indexFood, indexGuest]);}
      this.buttFoodGuest.sort();
      let result = [];

      this.whoEatFood = [];

      let currentKey = this.buttFoodGuest[0][0];
      for (let i = 0; i < this.buttFoodGuest.length; i++) {
        if (this.buttFoodGuest[i][0] === currentKey) {
          result.push(this.buttFoodGuest[i][1]);
        } else {
          this.whoEatFood.push(result);
          result = [this.buttFoodGuest[i][1]];
          currentKey = this.buttFoodGuest[i][0];
        }
      }
      if (result.length > 0) {
        this.whoEatFood.push(result);
      }

    },
    counting(){
      let pip = []; //  список заказчиков в виде индексов из списка имен
      for (let i = 0; i < this.selectedBuyMan.length; i++) {
        for (let j = 0; j < this.guests.length; j++) {
          if (this.selectedBuyMan[i] == this.guests[j]){
            pip.push(j);
          }
        }
      }
      let money = new Array(this.guests.length -1 ).fill(null).map(() => []);

      for (let i = 0; i < this.foods.length; i++) {
        let totalGuestsForFood = this.whoEatFood[i].length;
        for (let j = 0; j < this.whoEatFood[i].length; j++) {
          let guestIndex = this.whoEatFood[i][j];
          let priceShare = Math.ceil(this.prices[i] / totalGuestsForFood); // делим цену на количество кушателей

          // Проверяем, инициализирован ли money[guestIndex], если нет — инициализируем
          if (!money[guestIndex]) {
            money[guestIndex] = [];
          }

          if (pip[i] !== guestIndex) {
            money[guestIndex].push([
              this.guests[guestIndex],  // Кто должен
              this.guests[pip[i]],      // Кому должен (заказчику)
              priceShare                // Сумма
            ]);
          }
        }
      }

      let finalAmounts = {};
      for (let i = 0; i < money.length; i++) {
        for (let j = 0; j < money[i].length; j++) {
          let [debtor, creditor, amount] = money[i][j];

          // Формируем ключи для долга и обратного долга
          let key = `${debtor}->${creditor}`;
          let reverseKey = `${creditor}->${debtor}`;

          // Проверяем, существует ли обратный долг (creditor -> debtor)
          if (finalAmounts[reverseKey]) {
            // Взаимозачет: если есть долг в обратном направлении
            if (finalAmounts[reverseKey] > amount) {
              finalAmounts[reverseKey] -= amount;
            } else if (finalAmounts[reverseKey] < amount) {
              finalAmounts[key] = amount - finalAmounts[reverseKey];
              delete finalAmounts[reverseKey]; // удаляем обратный долг, т.к. компенсирован
            } else {
              // Если суммы равны, удаляем долг полностью
              delete finalAmounts[reverseKey];
            }
          } else {
            // Если обратного долга нет, просто записываем
            if (finalAmounts[key]) {
              finalAmounts[key] += amount;
            } else {
              finalAmounts[key] = amount;
            }
          }
        }
      }

      let firstFinalList = [];
      let secondFinalList = [];
      // Преобразуем объект finalAmounts в список
      for (let key in finalAmounts) {
        let [debtor, creditor] = key.split("->");
        firstFinalList.push([ debtor, creditor, finalAmounts[key] ]);
        secondFinalList.push([ creditor, debtor, finalAmounts[key] ]);
      }
      this.finalList = this.tableCount(firstFinalList);
      this.finalList2 = this.tableCount(secondFinalList);

    },
    tableCount(firstFinalList){

      let reduction = [];
      let reductionAll = [];
      for (let i = 0; i < this.guests.length; i++) {
        for (let j = 0; j < firstFinalList.length; j++) {
          if (firstFinalList[j][0] == this.guests[i]){
            reduction.push(firstFinalList[j]);
          }
        }
        if (reduction.length == 0){reduction = [[this.guests[i] + ' не', 'никому', '']]}
        reductionAll.push(reduction);
        reduction = [];
      }
      return(reductionAll);
    },
    toggleStyle(style) {
      this.style = style;
    },
    getSampleClass() {
      // Очищаем все классы у body
      document.body.className = '';

      // Применяем нужный класс для body в зависимости от выбранного стиля
      if (this.style === 1) {
         document.body.classList.add('active1');
      } else if (this.style === 2) {
         document.body.classList.add('active2');
      } else if (this.style === 3) {
         document.body.classList.add('active3');
      }

      // Возвращаем объект с классами для элементов
      return {
         active1: this.style === 1,
         active2: this.style === 2,
         active3: this.style === 3
      };
    },
    toggleAudio() {
      const audio = document.getElementById('audio');
      if (this.isPlaying) {
        audio.pause(); // Остановить воспроизведение
      } else {
        audio.play(); // Начать воспроизведение
      }
      this.isPlaying = !this.isPlaying; // Переключить состояние
    },
    changeVolume(event) {
      const audio = document.getElementById('audio');
      audio.volume = event.target.value;
      }
  }});
