import { Input, Form, Flex, Layout, Button, Radio, DatePicker, Switch, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import dayjs from "dayjs";

const buttonStyle = {
  background: '#819b57',
  marginRight: 'auto',
}
const button2Style = {
  background: '#819b57',
  marginRight: 'auto',
}
const button1Style = {
  background: '#819b57',
  marginRight: '20px',
}
const { Header, Content } = Layout;
const headerStyle = {
  textAlign: 'center',
  height: 80,
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  background: '#faf4ea',
};
const contentStyle = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  textAlign: 'center',
  minHeight: 'calc(100vh - 80px)',
  width: '100vw',
  color: '#31261a',
  fontSize: '52px',
  paddingTop: '10px',
  backgroundColor: '#faf4ea',
};
const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
};
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  popup: {

    background: "white",
    padding: 20,
    borderRadius: 8,
    width: "500px",
  }
};

export default function Profile() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const navigate = useNavigate();
  const [isDead, setIsDead] = useState(false);

  return (
    <Flex>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>

          <Button style={buttonStyle} onClick={() => navigate('/')}>Головна</Button>

          <Button style={button1Style} onClick={() => { if (!open1 && !open2) setOpen(true) }}>Додати родича</Button>

          <Button style={button1Style} onClick={() => { if (!open && !open2) setOpen1(true) }}>Видалити родича</Button>


          <Button style={button2Style} onClick={() => { if (!open && !open1) setOpen2(true) }}>Редагувати родича</Button>
          {open && (
            <div style={styles.overlay}>
              <div style={styles.popup}>
                <Form
                  form={form}
                  name="editree"
                  layout="vertical"
                  autoComplete="off"
                  size="large"
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
                            'Коректний формат: Прізвище Ім’я По батькові (тільки українські літери)'
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
                    rules={[
                      { required: true, message: "Введіть дату народження" },
                    ]}
                  >
                    <DatePicker
                      format="DD.MM.YYYY"
                      style={{ width: "100%" }}
                      disabledDate={(current) => current && current > dayjs().endOf("day")}
                    />
                  </Form.Item>


                  <Form.Item label="Чи людина померла?">
                    <Switch checked={isDead} onChange={setIsDead} />
                  </Form.Item>
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



                  {isDead && (
                    <Form.Item
                      label="Дата смерті"
                      name="deathDate"
                      rules={[
                        { required: true, message: "Введіть дату смерті" },
                        {
                          validator(_, value) {
                            const birth = Form.getFieldValue("birthDate");

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
                    label="Хвороба"
                    name="disease"
                    rules={[{ required: true, message: 'Виберіть хворобу' }]}
                  >
                    <Select placeholder="Оберіть хворобу" allowClear>
                      <Select.Option value="achondroplasia">Ахондроплазія </Select.Option>
                      <Select.Option value="diabetes2">Діабет 2 типу </Select.Option>
                      <Select.Option value="allergy">Алергія </Select.Option>
                      <Select.Option value="ovarian_cancer">Рак яєчників </Select.Option>
                      <Select.Option value="migraine">Мігрень </Select.Option>
                      <Select.Option value="obesity">Ожиріння </Select.Option>
                    </Select>
                  </Form.Item>



                </Form>
                <button onClick={() => setOpen(false)}>Close</button>
              </div>
            </div>
          )}
          {open1 && (
            <div style={styles.overlay}>
              <div style={styles.popup}>
                <Form
                  form={form}
                  name="register"
                  layout="vertical"
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Будь ласка, введіть email' },
                      { type: 'email', message: 'Введіть коректний email' },
                    ]}
                  >
                    <Input placeholder="your@email.com" />
                  </Form.Item>


                </Form>
                <button onClick={() => setOpen1(false)}>Close</button>
              </div>
            </div>
          )}
          {open2 && (
            <div style={styles.overlay}>
              <div style={styles.popup}>
                <Form
                  form={form}
                  name="register"
                  layout="vertical"
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Будь ласка, введіть email' },
                      { type: 'email', message: 'Введіть коректний email' },
                    ]}
                  >
                    <Input placeholder="your@email.com" />
                  </Form.Item>


                </Form>
                <button onClick={() => setOpen2(false)}>Close</button>
              </div>
            </div>
          )}
        </Header>
        <Content style={contentStyle}>wtynh</Content>
      </Layout>
    </Flex>
  );




}
