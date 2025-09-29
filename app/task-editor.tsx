import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORIES } from '@/constants/categories';
import { useGame } from '@/hooks/game-store';
import { Category, Gender } from '@/types/game';

export default function TaskEditorScreen() {
  const { taskBank, addTask } = useGame();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<Category>('знакомство');
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  const [newTaskText, setNewTaskText] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sectionAnim1 = useRef(new Animated.Value(0)).current;
  const sectionAnim2 = useRef(new Animated.Value(0)).current;
  const sectionAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    Animated.stagger(200, [
      Animated.timing(sectionAnim1, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sectionAnim2, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sectionAnim3, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, sectionAnim1, sectionAnim2, sectionAnim3]);

  const handleAddTask = () => {
    if (newTaskText.trim().length === 0) {
      setShowErrorModal(true);
      return;
    }

    addTask(selectedCategory, selectedGender, newTaskText.trim());
    setNewTaskText('');
    setShowSuccessModal(true);
  };

  const currentTasks = taskBank[selectedCategory][selectedGender];

  return (
    <>
      <Stack.Screen options={{ title: 'Редактор заданий', headerShown: true }} />
      <LinearGradient
        colors={['#8B0000', '#DC143C', '#FF1493', '#8B008B']}
        style={styles.container}
      >
        <Animated.View style={[styles.scrollView, { opacity: fadeAnim }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
              <Text style={styles.title}>Редактор заданий</Text>

              <Animated.View style={[styles.section, { opacity: sectionAnim1, transform: [{ translateY: sectionAnim1.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
                <Text style={styles.sectionTitle}>Категория</Text>
                <View style={styles.categoryContainer}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: category.color },
                        selectedCategory === category.key && styles.selectedCategoryButton,
                      ]}
                      onPress={() => setSelectedCategory(category.key)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        { color: category.color === '#FFFFFF' ? '#1a1a1a' : '#FFF' }
                      ]}>
                        {category.emoji} {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              <Animated.View style={[styles.section, { opacity: sectionAnim2, transform: [{ translateY: sectionAnim2.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
                <Text style={styles.sectionTitle}>Пол</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      selectedGender === 'male' && styles.selectedGenderButton,
                    ]}
                    onPress={() => setSelectedGender('male')}
                  >
                    <Text style={styles.genderButtonText}>👨 Мужчины</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      selectedGender === 'female' && styles.selectedGenderButton,
                    ]}
                    onPress={() => setSelectedGender('female')}
                  >
                    <Text style={styles.genderButtonText}>👩 Женщины</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              <Animated.View style={[styles.section, { opacity: sectionAnim3, transform: [{ translateY: sectionAnim3.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
                <Text style={styles.sectionTitle}>Новое задание</Text>
                <TextInput
                  style={styles.taskInput}
                  placeholder="Введите текст задания..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                  multiline
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddTask}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Добавить задание</Text>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Существующие задания ({currentTasks.length})
                </Text>
                <View style={styles.tasksContainer}>
                  {currentTasks.map((task, index) => (
                    <View key={task.id} style={styles.taskItem}>
                      <Text style={styles.taskNumber}>{index + 1}.</Text>
                      <Text style={styles.taskItemText}>{task.text}</Text>
                    </View>
                  ))}
                  {currentTasks.length === 0 && (
                    <Text style={styles.emptyText}>Нет заданий в этой категории</Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ошибка</Text>
            <Text style={styles.modalText}>Введите текст задания</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Успешно</Text>
            <Text style={styles.modalText}>Задание добавлено!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryButton: {
    borderColor: '#FFFFFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedGenderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  genderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  taskInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tasksContainer: {
    gap: 8,
  },
  taskItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskNumber: {
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 20,
  },
  taskItemText: {
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#DC143C',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});