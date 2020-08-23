import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const foodsList = await (await api.get<IFoodPlate[]>('/foods')).data;
      // console.log(foodsList);
      setFoods(foodsList);
    }
    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const FoodForAdd = {
        available: true,
        name: food.name,
        image: food.image,
        description: food.description,
        price: food.price,
      };
      const newFood = await api.post('foods', FoodForAdd);
      if (newFood) {
        setFoods([...foods, newFood.data]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    await api.put(`foods/${editingFood.id}`, food);
    const newFoodsList = foods.map(foodItem => {
      if (foodItem.id === editingFood.id) {
        const updatedFood = {
          id: editingFood.id,
          available: editingFood.available,
          name: food.name,
          image: food.image,
          description: food.description,
          price: food.price,
        };
        return updatedFood;
      }
      return foodItem;
    });
    setFoods(newFoodsList);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`foods/${id}`);
    const newfoodList = foods.filter(food => food.id !== id);
    setFoods(newfoodList);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
