import { Layout, Card, List, Tag, Spin, Empty, Button, Modal, Form, Input, Select, InputNumber, DatePicker, Switch, message } from 'antd';
import { UserOutlined, HeartOutlined, MedicineBoxOutlined, EditOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const contentStyle = {
  textAlign: 'center',
  minHeight: 'calc(100vh - 80px - 60px)',
  width: '100vw',
  color: '#31261a',
  paddingTop: '30px',
  backgroundColor: '#faf4ea',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
};

const titleStyle = {
  fontSize: '42px',
  marginBottom: '30px',
  color: '#31261a',
};

export default function AppContent(){
    const [relatives, setRelatives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editingRelative, setEditingRelative] = useState(null);
    const [addLoading, setAddLoading] = useState(false);
    const [isDead, setIsDead] = useState(false);
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            fetchRelatives();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const onFinishAddRelative = async (values) => {
        setAddLoading(true);
        setError(null);

        try {
            // Parse full name into last, first, and middle names
            const nameParts = values.name.trim().split(' ');
            const lastName = nameParts[0];
            const firstName = nameParts[1] || '';
            const middleName = nameParts.slice(2).join(' ');

            // Format date of birth
            const dateOfBirth = values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null;

            // Parse blood type (e.g., "A+" -> bloodType: "A", rhesusFactor: "PLUS")
            const bloodTypeMatch = values.bloodType.match(/^([0AB]+)([\+\-])$/);
            let bloodType = bloodTypeMatch ? bloodTypeMatch[1] : null;
            if (bloodType === '0') {
                bloodType = 'O';
            }
            const rhesusFactor = bloodTypeMatch && bloodTypeMatch[2] === '+' ? 'PLUS' : 'MINUS';

            // Map gender to backend format
            const gender = values.gender === 'male' ? 'MAN' : 'WOMEN';

            // Конвертуємо масив хвороб у CSV string
            const diseaseString = values.disease && values.disease.length > 0 
                ? values.disease.join(',') 
                : null;

            const requestData = {
                firstName,
                middleName,
                lastName,
                dateOfBirth,
                gender,
                bloodType,
                rhesusFactor,
                disease: diseaseString
            };

            const response = await fetch('http://localhost:8080/api/relatives', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    message.error('Ваша сесія закінчилася. Будь ласка, увійдіть знову.');
                    navigate('/login');
                    return;
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to add relative');
            }

            const data = await response.json();
            
            // Оновити список
            await fetchRelatives();
            
            // Reset form and close modal
            addForm.resetFields();
            setIsDead(false);
            setAddModalVisible(false);
            message.success('Родич успішно доданий!');
            
        } catch (err) {
            console.error('Error adding relative:', err);
            message.error('Помилка: ' + (err.message || 'Не вдалося додати родича'));
        } finally {
            setAddLoading(false);
        }
    };

    const fetchRelatives = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/relatives', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch relatives');
            }

            const data = await response.json();
            setRelatives(data);
        } catch (err) {
            console.error('Error fetching relatives:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getBloodTypeDisplay = (relative) => {
        if (relative.bloodType && relative.rhesusFactor) {
            const rhesus = relative.rhesusFactor === 'PLUS' ? '+' : '-';
            return `${relative.bloodType}${rhesus}`;
        }
        return 'Не вказано';
    };

    const getGenderDisplay = (gender) => {
        if (gender === 'MAN') return 'Чоловік';
        if (gender === 'WOMEN') return 'Жінка';
        return 'Не вказано';
    };

    const getDiseaseDisplay = (diseaseCode) => {
        const diseaseMap = {
            'achondroplasia': 'Ахондроплазія',
            'diabetes2': 'Діабет 2 типу',
            'allergy': 'Алергія',
            'ovarian_cancer': 'Рак яєчників',
            'migraine': 'Мігрень',
            'obesity': 'Ожиріння'
        };
        
        return diseaseMap[diseaseCode] || diseaseCode || 'Не вказано';
    };

    const handleDelete = async (relativeId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цього родича?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/relatives/${relativeId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete relative');
            }

            // Оновити список після видалення
            setRelatives(relatives.filter(r => r.id !== relativeId));
            alert('Родич успішно видалений!');
        } catch (err) {
            console.error('Error deleting relative:', err);
            alert('Помилка при видаленні родича');
        }
    };

    const handleEdit = (relative) => {
        setEditingRelative(relative);
        
        // Перетворюємо bloodType з "A" в "A+" або "A-"
        let bloodTypeDisplay = '';
        if (relative.bloodType && relative.rhesusFactor) {
            const rhesus = relative.rhesusFactor === 'PLUS' ? '+' : '-';
            bloodTypeDisplay = `${relative.bloodType}${rhesus}`;
        }
        
        // Перетворюємо disease з CSV string в масив
        let diseases = [];
        if (relative.disease) {
            diseases = relative.disease.split(',').map(d => d.trim()).filter(d => d);
        }
        
        form.setFieldsValue({
            firstName: relative.firstName,
            middleName: relative.middleName,
            lastName: relative.lastName,
            dateOfBirth: relative.dateOfBirth ? dayjs(relative.dateOfBirth) : null,
            gender: relative.gender,
            bloodType: bloodTypeDisplay,
            diseases: diseases,
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            // Parse blood type
            const bloodTypeMatch = values.bloodType?.match(/^([0OABAB]+)([\+\-])$/);
            let bloodType = bloodTypeMatch ? bloodTypeMatch[1] : null;
            if (bloodType === '0') bloodType = 'O';
            const rhesusFactor = bloodTypeMatch && bloodTypeMatch[2] === '+' ? 'PLUS' : 'MINUS';

            // Конвертуємо масив хвороб у CSV string
            const diseaseString = values.diseases && values.diseases.length > 0 
                ? values.diseases.join(',') 
                : null;

            const requestData = {
                firstName: values.firstName,
                middleName: values.middleName,
                lastName: values.lastName,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                gender: values.gender,
                bloodType: bloodType,
                rhesusFactor: rhesusFactor,
                disease: diseaseString,
            };

            const response = await fetch(`http://localhost:8080/api/persons/${editingRelative.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error('Failed to update relative');
            }

            const updatedRelative = await response.json();
            
            // Оновити список
            setRelatives(relatives.map(r => r.id === updatedRelative.id ? updatedRelative : r));
            
            setEditModalVisible(false);
            setEditingRelative(null);
            form.resetFields();
            alert('Родич успішно оновлений!');
            
            // Перезавантажити список
            fetchRelatives();
        } catch (err) {
            console.error('Error updating relative:', err);
            alert('Помилка при оновленні родича');
        }
    };

    if (!isAuthenticated) {
        return (
            <Layout.Content style={contentStyle}>
                <div style={containerStyle}>
                    <h1 style={titleStyle}>Твоє родинне дерево</h1>
                    <Card>
                        <p style={{ fontSize: '18px' }}>
                            Будь ласка, увійдіть в систему щоб побачити своїх родичів
                        </p>
                        <Button 
                            type="primary" 
                            size="large"
                            onClick={() => navigate('/login')}
                            style={{ background: '#819b57', marginTop: '20px' }}
                        >
                            Увійти
                        </Button>
                    </Card>
                </div>
            </Layout.Content>
        );
    }

    if (loading) {
        return (
            <Layout.Content style={contentStyle}>
                <Spin size="large" />
            </Layout.Content>
        );
    }

    if (error) {
        return (
            <Layout.Content style={contentStyle}>
                <div style={containerStyle}>
                    <h1 style={titleStyle}>Твоє родинне дерево</h1>
                    <Card>
                        <p style={{ color: 'red' }}>Помилка: {error}</p>
                        <Button onClick={fetchRelatives}>Спробувати ще раз</Button>
                    </Card>
                </div>
            </Layout.Content>
        );
    }

    return (
        <Layout.Content style={contentStyle}>
            <div style={containerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ ...titleStyle, marginBottom: 0 }}>Твоє родинне дерево</h1>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalVisible(true)}
                        style={{ background: '#819b57' }}
                    >
                        Додати родича
                    </Button>
                </div>

                {relatives.length === 0 ? (
                    <Card>
                        <Empty 
                            description="У вас поки немає родичів"
                            style={{ padding: '40px 0' }}
                        />
                    </Card>
                ) : (
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 2,
                            lg: 3,
                            xl: 3,
                            xxl: 4,
                        }}
                        dataSource={relatives}
                        renderItem={(relative) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    style={{ textAlign: 'left' }}
                                    actions={[
                                        <Button 
                                            type="link" 
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(relative)}
                                        >
                                            Редагувати
                                        </Button>,
                                        <Button 
                                            type="link" 
                                            danger
                                            onClick={() => handleDelete(relative.id)}
                                        >
                                            Видалити
                                        </Button>,
                                    ]}
                                >
                                    <Card.Meta
                                        avatar={<UserOutlined style={{ fontSize: '32px', color: '#819b57' }} />}
                                        title={
                                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                                {relative.firstName || 'Не вказано'} {relative.middleName || ''} {relative.lastName || ''}
                                            </span>
                                        }
                                        description={
                                            <div style={{ marginTop: '15px', fontSize: '14px' }}>
                                                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                                    <UserOutlined style={{ marginRight: '8px' }} />
                                                    <strong>Стать:</strong>&nbsp;{getGenderDisplay(relative.gender)}
                                                </div>
                                                {relative.dateOfBirth && (
                                                    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                                        <CalendarOutlined style={{ marginRight: '8px' }} />
                                                        <strong>Дата народження:</strong>&nbsp;{dayjs(relative.dateOfBirth).format('DD.MM.YYYY')}
                                                    </div>
                                                )}
                                                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                                    <HeartOutlined style={{ marginRight: '8px', color: 'red' }} />
                                                    <strong>Група крові:</strong>&nbsp;{getBloodTypeDisplay(relative)}
                                                </div>
                                                {relative.disease && (
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                            <MedicineBoxOutlined style={{ marginRight: '8px', color: 'green' }} />
                                                            <strong>Хвороби:</strong>
                                                        </div>
                                                        <div style={{ paddingLeft: '28px' }}>
                                                            {relative.disease.split(',').map(d => d.trim()).filter(d => d).map((disease, idx) => (
                                                                <Tag key={idx} color="orange" style={{ marginBottom: '5px' }}>
                                                                    {getDiseaseDisplay(disease)}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {relative.isMainProfile && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <Tag color="blue">Основний профіль</Tag>
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                )}

                {/* Модальне вікно редагування */}
                <Modal
                    title="Редагувати родича"
                    open={editModalVisible}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setEditingRelative(null);
                        form.resetFields();
                    }}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleEditSubmit}
                    >
                        <Form.Item
                            label="Прізвище"
                            name="lastName"
                            rules={[{ required: true, message: 'Будь ласка, введіть прізвище' }]}
                        >
                            <Input placeholder="Мельник" />
                        </Form.Item>

                        <Form.Item
                            label="Ім'я"
                            name="firstName"
                            rules={[{ required: true, message: 'Будь ласка, введіть ім\'я' }]}
                        >
                            <Input placeholder="Антон" />
                        </Form.Item>

                        <Form.Item
                            label="По батькові"
                            name="middleName"
                        >
                            <Input placeholder="Олегович" />
                        </Form.Item>

                        <Form.Item
                            label="Дата народження"
                            name="dateOfBirth"
                            rules={[{ required: true, message: 'Будь ласка, оберіть дату народження' }]}
                        >
                            <DatePicker 
                                format="DD.MM.YYYY"
                                style={{ width: '100%' }}
                                placeholder="Оберіть дату"
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Стать"
                            name="gender"
                            rules={[{ required: true, message: 'Виберіть стать' }]}
                        >
                            <Select>
                                <Select.Option value="MAN">Чоловік</Select.Option>
                                <Select.Option value="WOMEN">Жінка</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Група крові"
                            name="bloodType"
                            rules={[{ required: true, message: 'Виберіть групу крові' }]}
                        >
                            <Select>
                                <Select.Option value="0+">0 (I) +</Select.Option>
                                <Select.Option value="0-">0 (I) -</Select.Option>
                                <Select.Option value="A+">A (II) +</Select.Option>
                                <Select.Option value="A-">A (II) -</Select.Option>
                                <Select.Option value="B+">B (III) +</Select.Option>
                                <Select.Option value="B-">B (III) -</Select.Option>
                                <Select.Option value="AB+">AB (IV) +</Select.Option>
                                <Select.Option value="AB-">AB (IV) -</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Хвороби"
                            name="diseases"
                        >
                            <Select 
                                mode="multiple"
                                placeholder="Оберіть хвороби (можна кілька або жодної)"
                                allowClear
                            >
                                <Select.Option value="Синдром Ретта">Синдром Ретта</Select.Option>
                                <Select.Option value="Інконтиненція пігменту">Інконтиненція пігменту</Select.Option>
                                <Select.Option value="Гемофілія A">Гемофілія А</Select.Option>
                                <Select.Option value="Рахіт">Рахіт</Select.Option>
                                <Select.Option value="Дальтонізм">Дальтонізм</Select.Option>
                                <Select.Option value="Втрата зору">втрата зору</Select.Option>
                                <Select.Option value="Чоловіче безпліддя">чоловіче безпліддя</Select.Option>
                                <Select.Option value="Ахондроплазія">Ахондроплазія</Select.Option>
                                <Select.Option value="Діабет 2-го типу">Діабет 2-го типу</Select.Option>
                                <Select.Option value="Алергія">Алергія</Select.Option>
                                <Select.Option value="Рак яєчників">Рак яєчників</Select.Option>
                                <Select.Option value="Мігрень">Мігрень</Select.Option>
                                <Select.Option value="Ожиріння">Ожиріння</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                style={{ marginRight: '10px', background: '#819b57' }}
                            >
                                Зберегти
                            </Button>
                            <Button onClick={() => {
                                setEditModalVisible(false);
                                setEditingRelative(null);
                                form.resetFields();
                            }}>
                                Скасувати
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Модальне вікно додавання родича */}
                <Modal
                    title="Додати родича"
                    open={addModalVisible}
                    onCancel={() => {
                        setAddModalVisible(false);
                        addForm.resetFields();
                        setIsDead(false);
                        setError(null);
                    }}
                    footer={null}
                    width={700}
                >
                    <Form
                        form={addForm}
                        layout="vertical"
                        onFinish={onFinishAddRelative}
                    >
                        <Form.Item
                            label="ПІБ"
                            name="name"
                            rules={[
                                { required: true, message: 'Будь ласка, введіть ПІБ родича' },
                                {
                                    validator(_, value) {
                                        if (!value) return Promise.resolve();

                                        const fullNameRegex = /^[А-ЯІЇЄҐ][а-яіїєґ']+(-[А-ЯІЇЄҐ][а-яіїєґ']+)? [А-ЯІЇЄҐ][а-яіїєґ']+(-[А-ЯІЇЄҐ][а-яіїєґ']+)? [А-ЯІЇЄҐ][а-яіїєґ']+(-[А-ЯІЇЄҐ][а-яіїєґ']+)?$/;

                                        if (fullNameRegex.test(value.trim())) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject(
                                            'Коректний формат: Прізвище Ім\'я По батькові (тільки українські літери)'
                                        );
                                    },
                                },
                            ]}
                        >
                            <Input placeholder="Яцунь Олександр Олександрович" />
                        </Form.Item>

                        <Form.Item
                            label="Стать"
                            name="gender"
                            rules={[{ required: true, message: 'Виберіть стать' }]}
                        >
                            <Select placeholder="Оберіть стать">
                                <Select.Option value="male">Чоловіча</Select.Option>
                                <Select.Option value="female">Жіноча</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Дата народження"
                            name="birthDate"
                            rules={[{ required: true, message: "Введіть дату народження" }]}
                        >
                            <DatePicker
                                format="DD.MM.YYYY"
                                style={{ width: "100%" }}
                                placeholder="Оберіть дату"
                                disabledDate={(current) => current && current > dayjs().endOf("day")}
                            />
                        </Form.Item>

                        <Form.Item label="Чи людина померла?">
                            <Switch checked={isDead} onChange={setIsDead} />
                        </Form.Item>

                        {isDead && (
                            <Form.Item
                                label="Дата смерті"
                                name="deathDate"
                                rules={[
                                    { required: true, message: "Введіть дату смерті" },
                                    {
                                        validator(_, value) {
                                            const birth = addForm.getFieldValue("birthDate");
                                            if (!value || !birth) return Promise.resolve();
                                            if (value.isBefore(birth)) {
                                                return Promise.reject("Дата смерті не може бути раніше дати народження");
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <DatePicker
                                    format="DD.MM.YYYY"
                                    style={{ width: "100%" }}
                                    disabledDate={(current) => current && current > dayjs().endOf("day")}
                                />
                            </Form.Item>
                        )}

                        <Form.Item
                            label="Група крові"
                            name="bloodType"
                            rules={[{ required: true, message: 'Виберіть групу крові' }]}
                        >
                            <Select placeholder="Оберіть групу крові">
                                <Select.Option value="0+">0 (I) +</Select.Option>
                                <Select.Option value="0-">0 (I) -</Select.Option>
                                <Select.Option value="A+">A (II) +</Select.Option>
                                <Select.Option value="A-">A (II) -</Select.Option>
                                <Select.Option value="B+">B (III) +</Select.Option>
                                <Select.Option value="B-">B (III) -</Select.Option>
                                <Select.Option value="AB+">AB (IV) +</Select.Option>
                                <Select.Option value="AB-">AB (IV) -</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Хвороби"
                            name="disease"
                        >
                            <Select 
                                mode="multiple"
                                placeholder="Оберіть хвороби (можна кілька або жодної)" 
                                allowClear
                            >
                                <Select.Option value="Синдром Ретта">Синдром Ретта</Select.Option>
                                <Select.Option value="Інконтиненція пігменту">Інконтиненція пігменту</Select.Option>
                                <Select.Option value="Гемофілія A">Гемофілія А</Select.Option>
                                <Select.Option value="Рахіт">Рахіт</Select.Option>
                                <Select.Option value="Дальтонізм">Дальтонізм</Select.Option>
                                <Select.Option value="Втрата зору">втрата зору</Select.Option>
                                <Select.Option value="Чоловіче безпліддя">чоловіче безпліддя</Select.Option>
                                <Select.Option value="Ахондроплазія">Ахондроплазія</Select.Option>
                                <Select.Option value="Діабет 2-го типу">Діабет 2-го типу</Select.Option>
                                <Select.Option value="Алергія">Алергія</Select.Option>
                                <Select.Option value="Рак яєчників">Рак яєчників</Select.Option>
                                <Select.Option value="Мігрень">Мігрень</Select.Option>
                                <Select.Option value="Ожиріння">Ожиріння</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={addLoading}
                                style={{ marginRight: '10px', background: '#819b57' }}
                            >
                                Додати родича
                            </Button>
                            <Button onClick={() => {
                                setAddModalVisible(false);
                                addForm.resetFields();
                                setIsDead(false);
                                setError(null);
                            }}>
                                Скасувати
                            </Button>
                        </Form.Item>

                        {error && (
                            <div style={{ color: 'red', marginTop: '10px' }}>
                                {error}
                            </div>
                        )}
                    </Form>
                </Modal>
            </div>
        </Layout.Content>
    );
}