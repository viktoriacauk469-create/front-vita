import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Card, Form, Select, Button, Table, Spin, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from './layout/AppHeader';
import AppFooter from './layout/AppFooter';

const { Content } = Layout;

const contentStyle = {
  minHeight: 'calc(100vh - 140px)',
  padding: '30px',
  backgroundColor: '#f7f4ec',
  display: 'flex',
  justifyContent: 'center',
};

const cardStyle = {
  maxWidth: '760px',
  width: '100%',
};

// Функції для обчислення передбачень (перенесені з HTML)
const genotypePairsFromPhenotype_ABO = (phen) => {
  phen = (phen || '').toUpperCase();
  if (phen === 'A') return [['A','A'], ['A','O']];
  if (phen === 'B') return [['B','B'], ['B','O']];
  if (phen === 'AB') return [['A','B']];
  if (phen === 'O') return [['O','O']];
  return [['O','O']];
};

const genotypePairsFromPhenotype_Rh = (rh) => {
  if (rh === '+') return [['D','D'], ['D','d']];
  return [['d','d']];
};

const combineParents = (fGenotypes, mGenotypes) => {
  const childABOcounts = {'A':0,'B':0,'AB':0,'O':0};
  const weightPerPair = 1/(fGenotypes.length * mGenotypes.length);
  for (const fg of fGenotypes) {
    for (const mg of mGenotypes) {
      for (const a of fg) {
        for (const b of mg) {
          const child = [a,b].sort().join('');
          let ph;
          if (child === 'AB') ph = 'AB';
          else if (child.includes('A') && !child.includes('B')) ph = 'A';
          else if (child.includes('B') && !child.includes('A')) ph = 'B';
          else ph = 'O';
          childABOcounts[ph] += weightPerPair * 0.25;
        }
      }
    }
  }
  return childABOcounts;
};

const combineRh = (fRhGenotypes, mRhGenotypes) => {
  const counts = {'+':0,'-':0};
  const weight = 1/(fRhGenotypes.length * mRhGenotypes.length);
  for (const fg of fRhGenotypes) {
    for (const mg of mRhGenotypes) {
      for (const fa of fg) {
        for (const ma of mg) {
          const ph = ([fa,ma].includes('D')) ? '+' : '-';
          counts[ph] += weight * 0.25;
        }
      }
    }
  }
  return counts;
};

const roman = {'A':'II','B':'III','AB':'IV','O':'I'};

export default function Predict() {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [diseaseResults, setDiseaseResults] = useState(null);
  const [relatives, setRelatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Отримати список родичів
    const fetchRelatives = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/relatives', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRelatives(data);
        }
      } catch (err) {
        console.error('Failed to fetch relatives:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatives();
  }, []);

  // Створити список опцій для вибору батька/матері
  const parentOptions = useMemo(() => {
    const options = [];
    
    // Додати користувача якщо у нього є група крові
    if (user?.bloodType && user?.rhesusFactor) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Ви (Основний профіль)';
      options.push({
        value: 'user',
        label: `${fullName} - ${user.bloodType}${user.rhesusFactor === 'PLUS' ? '+' : '-'} (Ви)`,
        bloodType: user.bloodType,
        rhesusFactor: user.rhesusFactor === 'PLUS' ? '+' : '-',
      });
    }

    // Додати всіх родичів
    relatives.forEach((relative) => {
      if (relative.bloodType && relative.rhesusFactor) {
        const fullName = `${relative.lastName || ''} ${relative.firstName || ''} ${relative.middleName || ''}`.trim();
        const rhDisplay = relative.rhesusFactor === 'PLUS' ? '+' : '-';
        options.push({
          value: `relative-${relative.id}`,
          label: `${fullName} - ${relative.bloodType}${rhDisplay}`,
          bloodType: relative.bloodType,
          rhesusFactor: rhDisplay,
        });
      }
    });

    return options;
  }, [user, relatives]);

  useEffect(() => {
    // Автоматично встановити користувача як батька, якщо є опція
    if (user?.bloodType && user?.rhesusFactor && parentOptions.length > 0 && !loading) {
      const userOption = parentOptions.find(opt => opt.value === 'user');
      if (userOption) {
        const currentFather = form.getFieldValue('father');
        if (!currentFather) {
          form.setFieldsValue({
            father: 'user',
            fatherType: userOption.bloodType,
            fatherRh: userOption.rhesusFactor,
          });
        }
      }
    }
  }, [user, loading, parentOptions]);

  const handleParentChange = (field, value) => {
    const selectedOption = parentOptions.find(opt => opt.value === value);
    if (selectedOption) {
      form.setFieldsValue({
        [`${field}Type`]: selectedOption.bloodType,
        [`${field}Rh`]: selectedOption.rhesusFactor,
        [`${field}Id`]: selectedOption.value,
      });
    }
  };

  // Отримати хвороби та стать обраного батька/матері
  const getParentData = (parentValue) => {
    if (parentValue === 'user') {
      // Знайти основний профіль користувача серед родичів
      const mainProfile = relatives.find(r => r.isMainProfile === true);
      let diseases = [];
      
      if (mainProfile?.disease) {
        diseases = mainProfile.disease.split(',').map(d => d.trim()).filter(d => d.length > 0);
      } else if (user?.diseases) {
        // Якщо не знайшли в relatives, спробувати з user object
        diseases = user.diseases.split(',').map(d => d.trim()).filter(d => d.length > 0);
      }
      
      console.log('User main profile diseases:', diseases, 'from mainProfile:', mainProfile?.disease, 'from user:', user?.diseases);
      return {
        diseases,
        gender: mainProfile?.gender || user?.gender || null,
      };
    } else if (parentValue && parentValue.startsWith('relative-')) {
      const relativeId = parseInt(parentValue.replace('relative-', ''));
      const relative = relatives.find(r => r.id === relativeId);
      if (relative) {
        const diseases = relative.disease ? relative.disease.split(',').map(d => d.trim()).filter(d => d.length > 0) : [];
        console.log(`Relative ${relativeId} diseases:`, diseases, 'raw:', relative.disease);
        return {
          diseases,
          gender: relative.gender || null,
        };
      }
    }
    return { diseases: [], gender: null };
  };

  // Функція обчислення ризиків хвороб
  const calculateDiseaseRisks = (fatherValue, motherValue, childGender) => {
    // Якщо значення не передані, отримуємо з форми
    const values = form.getFieldsValue();
    const finalFatherValue = fatherValue !== undefined ? fatherValue : values.father;
    const finalMotherValue = motherValue !== undefined ? motherValue : values.mother;
    const finalChildGender = childGender !== undefined ? childGender : values.childGender;

    if (!finalFatherValue || !finalMotherValue || !finalChildGender) {
      console.log('Missing parent values or child gender:', { 
        fatherValue: finalFatherValue, 
        motherValue: finalMotherValue, 
        childGender: finalChildGender 
      });
      return [];
    }

    const fatherData = getParentData(finalFatherValue);
    const motherData = getParentData(finalMotherValue);

    console.log('Parent data:', { fatherData, motherData, childGender: finalChildGender });

    // Функція для перевірки наявності хвороби в списку
    // Враховуємо точні назви з форми реєстрації та варіації
    const hasDisease = (diseases, exactNames, keywords = []) => {
      if (!diseases || diseases.length === 0) {
        console.log('No diseases to check');
        return false;
      }
      
      console.log('Checking diseases:', diseases, 'against exactNames:', exactNames, 'keywords:', keywords);
      
      // Спочатку перевіряємо точні назви (як зберігаються в БД)
      const exactMatch = diseases.some(d => {
        const dTrimmed = d.trim();
        const match = exactNames.some(exact => {
          const exactTrimmed = exact.trim();
          const isMatch = dTrimmed === exactTrimmed || 
                         dTrimmed.toLowerCase() === exactTrimmed.toLowerCase() ||
                         dTrimmed.toLowerCase().includes(exactTrimmed.toLowerCase()) ||
                         exactTrimmed.toLowerCase().includes(dTrimmed.toLowerCase());
          if (isMatch) {
            console.log(`Exact match found: "${dTrimmed}" matches "${exactTrimmed}"`);
          }
          return isMatch;
        });
        return match;
      });
      
      if (exactMatch) {
        console.log('Disease found via exact match');
        return true;
      }
      
      // Потім перевіряємо ключові слова
      if (keywords.length > 0) {
        const keywordMatch = diseases.some(d => {
          const lowerD = d.toLowerCase().trim();
          return keywords.some(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            const isMatch = lowerD.includes(lowerKeyword) || lowerKeyword.includes(lowerD);
            if (isMatch) {
              console.log(`Keyword match found: "${lowerD}" matches keyword "${lowerKeyword}"`);
            }
            return isMatch;
          });
        });
        
        if (keywordMatch) {
          console.log('Disease found via keyword match');
          return true;
        }
      }
      
      console.log('No match found for diseases:', diseases);
      return false;
    };

    // Точні назви хвороб з форми реєстрації (value атрибути)
    const diseaseRules = {
      'rett_syndrome': {
        name: 'Синдром Ретта',
        risk: hasDisease(fatherData.diseases, ['Синдром Ретта'], ['ретта', 'rett']) 
          ? { daughters: 100, sons: 0 }
          : { daughters: 0, sons: 0 }
      },
      'incontinentia_pigmenti': {
        name: 'Інконтиненція пігменту',
        risk: hasDisease(fatherData.diseases, ['Інконтиненція пігменту'], ['пігменту', 'інконтиненція'])
          ? { daughters: 100, sons: 0 }
          : { daughters: 0, sons: 0 }
      },
      'hemophilia_a': {
        name: 'Гемофілія A',
        risk: hasDisease(motherData.diseases, ['Гемофілія A', 'Гемофілія А'], ['гемофілія'])
          ? { daughters: 0, sons: 50 }
          : { daughters: 0, sons: 0 }
      },
      'rickets': {
        name: 'Рахіт',
        risk: hasDisease(fatherData.diseases, ['Рахіт'], ['рахіт'])
          ? { daughters: 100, sons: 0 }
          : { daughters: 0, sons: 0 }
      },
      'color_blindness': {
        name: 'Дальтонізм',
        risk: hasDisease(motherData.diseases, ['Дальтонізм'], ['дальтонізм'])
          ? { daughters: 0, sons: 50 }
          : { daughters: 0, sons: 0 }
      },
      'vision_loss': {
        name: 'Втрата зору',
        risk: hasDisease(motherData.diseases, ['Втрата зору', 'втрата зору'], ['зору', 'зір', 'vision', 'втрата'])
          ? { daughters: 100, sons: 100 }
          : { daughters: 0, sons: 0 }
      },
      'male_infertility': {
        name: 'Чоловіче безпліддя',
        risk: hasDisease(fatherData.diseases, ['Чоловіче безпліддя', 'чоловіче безпліддя'], ['безпліддя', 'infertility', 'чоловіче'])
          ? { daughters: 0, sons: 100 }
          : { daughters: 0, sons: 0 }
      },
      'achondroplasia': {
        name: 'Ахондроплазія',
        risk: (hasDisease(fatherData.diseases, ['Ахондроплазія'], ['ахондроплазія']) &&
               hasDisease(motherData.diseases, ['Ахондроплазія'], ['ахондроплазія']))
          ? { daughters: 50, sons: 50 }
          : { daughters: 0, sons: 0 }
      },
      'diabetes2': {
        name: 'Діабет 2-го типу',
        risk: (hasDisease(fatherData.diseases, ['Діабет 2-го типу'], ['діабет 2', 'діабет']) ||
               hasDisease(motherData.diseases, ['Діабет 2-го типу'], ['діабет 2', 'діабет']))
          ? { daughters: 50, sons: 50 }
          : { daughters: 0, sons: 0 }
      },
      'allergy': {
        name: 'Алергія',
        risk: (hasDisease(fatherData.diseases, ['Алергія'], ['алергія']) ||
               hasDisease(motherData.diseases, ['Алергія'], ['алергія']))
          ? { daughters: 60, sons: 60 } // Середнє значення 50-70%
          : { daughters: 0, sons: 0 }
      },
      'ovarian_cancer': {
        name: 'Рак яєчників',
        risk: (hasDisease(fatherData.diseases, ['Рак яєчників'], ['рак яєчників', 'ovarian']) ||
               hasDisease(motherData.diseases, ['Рак яєчників'], ['рак яєчників', 'ovarian']))
          ? { daughters: 25, sons: 0 }
          : { daughters: 0, sons: 0 }
      },
      'migraine': {
        name: 'Мігрень',
        risk: (hasDisease(fatherData.diseases, ['Мігрень'], ['мігрень']) ||
               hasDisease(motherData.diseases, ['Мігрень'], ['мігрень']))
          ? { daughters: 60, sons: 60 } // Середнє значення 50-70%
          : { daughters: 0, sons: 0 }
      },
      'obesity': {
        name: 'Ожиріння',
        risk: (hasDisease(fatherData.diseases, ['Ожиріння'], ['ожиріння']) ||
               hasDisease(motherData.diseases, ['Ожиріння'], ['ожиріння']))
          ? { daughters: 55, sons: 55 } // Середнє значення 40-70%
          : { daughters: 0, sons: 0 }
      },
    };

    const risks = [];
    Object.keys(diseaseRules).forEach(key => {
      const rule = diseaseRules[key];
      // Визначаємо ризик для обраної статі дитини
      const riskForChild = finalChildGender === 'daughter' ? rule.risk.daughters : rule.risk.sons;
      
      // Додаємо хворобу до списку, якщо є ризик для обраної статі
      if (riskForChild > 0) {
          risks.push({
            key,
            name: rule.name,
            risk: riskForChild,
            gender: finalChildGender === 'daughter' ? 'Дочірка' : 'Син',
            daughters: rule.risk.daughters,
            sons: rule.risk.sons,
          });
      }
    });

    console.log('Calculated disease risks:', risks);
    return risks;
  };

  const calculate = async () => {
    try {
      // Валідація форми перед обчисленням
      const values = await form.validateFields(['father', 'mother', 'childGender']);
      
      // Отримуємо всі значення після валідації
      const allValues = form.getFieldsValue();
      const fType = allValues.fatherType || 'O';
      const mType = allValues.motherType || 'O';
      const fRh = allValues.fatherRh || '+';
      const mRh = allValues.motherRh || '+';

      // Перевірка на наявність значень (включаючи перевірку на пусті рядки)
      const fatherValue = allValues.father?.trim() || null;
      const motherValue = allValues.mother?.trim() || null;
      const childGenderValue = allValues.childGender?.trim() || null;

      if (!fatherValue || !motherValue || !childGenderValue) {
        message.error('Будь ласка, заповніть всі обов\'язкові поля: Батько, Мати та Стать дитини');
        return;
      }

      const fABO = genotypePairsFromPhenotype_ABO(fType);
      const mABO = genotypePairsFromPhenotype_ABO(mType);
      const fRhG = genotypePairsFromPhenotype_Rh(fRh);
      const mRhG = genotypePairsFromPhenotype_Rh(mRh);

      const aboCounts = combineParents(fABO, mABO);
      const rhCounts = combineRh(fRhG, mRhG);

      setResults({ aboCounts, rhCounts, fatherType: fType, motherType: mType, fatherRh: fRh, motherRh: mRh });

      // Обчислити ризики хвороб
      const diseaseRisks = calculateDiseaseRisks(fatherValue, motherValue, childGenderValue);
      setDiseaseResults(diseaseRisks);
    } catch (errorInfo) {
      console.log('Validation failed:', errorInfo);
      message.error('Будь ласка, заповніть всі обов\'язкові поля');
    }
  };

  const reset = () => {
    const resetValues = {
      father: user?.bloodType && user?.rhesusFactor ? 'user' : undefined,
      mother: undefined,
      childGender: undefined,
      fatherType: user?.bloodType || undefined,
      fatherRh: user?.rhesusFactor === 'PLUS' ? '+' : (user?.rhesusFactor === 'MINUS' ? '-' : undefined),
      motherType: undefined,
      motherRh: undefined,
      fatherId: null,
      motherId: null,
    };
    form.resetFields();
    form.setFieldsValue(resetValues);
    // Автоматично встановити батька як користувача, якщо доступно
    if (user?.bloodType && user?.rhesusFactor && parentOptions.length > 0) {
      const userOption = parentOptions.find(opt => opt.value === 'user');
      if (userOption) {
        handleParentChange('father', 'user');
      }
    }
    setResults(null);
    setDiseaseResults(null);
  };

  const calculatePercentages = (counts) => {
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    const pct = {};
    Object.keys(counts).forEach(k => {
      pct[k] = Math.round((counts[k] / total) * 1000) / 10;
    });
    return pct;
  };

  const aboPercentages = results ? calculatePercentages(results.aboCounts) : null;
  const rhPercentages = results ? calculatePercentages(results.rhCounts) : null;

  const aboColumns = [
    {
      title: 'Група крові (римська)',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Ймовірність',
      dataIndex: 'probability',
      key: 'probability',
      render: (value) => `${value}%`,
    },
  ];

  const rhColumns = [
    {
      title: 'Rh',
      dataIndex: 'rh',
      key: 'rh',
    },
    {
      title: 'Ймовірність',
      dataIndex: 'probability',
      key: 'probability',
      render: (value) => `${value}%`,
    },
  ];

  const aboData = aboPercentages ? [
    { key: 'A', type: roman['A'], probability: aboPercentages['A'] },
    { key: 'B', type: roman['B'], probability: aboPercentages['B'] },
    { key: 'AB', type: roman['AB'], probability: aboPercentages['AB'] },
    { key: 'O', type: roman['O'], probability: aboPercentages['O'] },
  ] : [];

  const rhData = rhPercentages ? [
    { key: 'plus', rh: '+', probability: rhPercentages['+'] },
    { key: 'minus', rh: '-', probability: rhPercentages['-'] },
  ] : [];

  return (
    <Layout>
      <AppHeader />
      <Content style={contentStyle}>
        <Card style={cardStyle}>
          <h1 style={{ marginBottom: '12px' }}>Передбачення групи крові та ризиків хвороб</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Оберіть батька та матір зі списку ваших родичів, вкажіть стать дитини, натисніть «Розрахувати». 
            Система покаже передбачення групи крові дитини та ризики передачі спадкових хвороб з урахуванням статі.
          </p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <Spin size="large">
                <div style={{ padding: '50px' }}>
                  <p>Завантаження списку родичів...</p>
                </div>
              </Spin>
            </div>
          ) : (
          <Form form={form} layout="vertical" initialValues={{
            fatherType: null,
            fatherRh: null,
            motherType: null,
            motherRh: null,
            father: null,
            mother: null,
            childGender: null,
          }}>
            {/* Приховані поля для зберігання груп крові */}
            <Form.Item name="fatherType" hidden noStyle>
              <input type="hidden" defaultValue="" />
            </Form.Item>
            <Form.Item name="fatherRh" hidden noStyle>
              <input type="hidden" defaultValue="" />
            </Form.Item>
            <Form.Item name="motherType" hidden noStyle>
              <input type="hidden" defaultValue="" />
            </Form.Item>
            <Form.Item name="motherRh" hidden noStyle>
              <input type="hidden" defaultValue="" />
            </Form.Item>

            <Form.Item
              label="Батько"
              name="father"
              style={{ marginBottom: '12px' }}
              rules={[{ required: true, message: 'Будь ласка, оберіть батька' }]}
            >
              <Select 
                placeholder="Оберіть батька зі списку"
                loading={loading}
                onChange={(value) => handleParentChange('father', value)}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {parentOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value} label={option.label}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '-12px', marginBottom: '12px', paddingLeft: '12px' }}>
              Група крові буде автоматично підставлена з профілю обраної людини
            </div>

            <Form.Item
              label="Мати / Партнерка"
              name="mother"
              style={{ marginBottom: '12px' }}
              rules={[{ required: true, message: 'Будь ласка, оберіть матір' }]}
            >
              <Select 
                placeholder="Оберіть матір зі списку"
                loading={loading}
                onChange={(value) => handleParentChange('mother', value)}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {parentOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value} label={option.label}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '-12px', marginBottom: '12px', paddingLeft: '12px' }}>
              Група крові буде автоматично підставлена з профілю обраної людини
            </div>

            <Form.Item
              label="Стать дитини"
              name="childGender"
              style={{ marginBottom: '12px' }}
              rules={[{ required: true, message: 'Будь ласка, оберіть стать дитини' }]}
            >
              <Select placeholder="Оберіть стать дитини">
                <Select.Option value="daughter">Дочка</Select.Option>
                <Select.Option value="son">Син</Select.Option>
              </Select>
            </Form.Item>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '-12px', marginBottom: '12px', paddingLeft: '12px' }}>
              Стать дитини впливає на ризики передачі деяких спадкових хвороб
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', marginBottom: '20px' }}>
              <Button 
                type="primary" 
                onClick={calculate}
                style={{ background: '#6b9b54' }}
              >
                Розрахувати
              </Button>
              <Button onClick={reset}>Очистити</Button>
            </div>

            {results && (
              <div style={{ marginTop: '20px' }}>
                <h3>Результат передбачення групи крові</h3>
                <Table 
                  dataSource={aboData} 
                  columns={aboColumns} 
                  pagination={false}
                  style={{ marginTop: '12px', marginBottom: '20px' }}
                />
                <Table 
                  dataSource={rhData} 
                  columns={rhColumns} 
                  pagination={false}
                  style={{ marginBottom: '20px' }}
                />
              </div>
            )}

            {results && (
              <div style={{ marginTop: '30px' }}>
                <h3>Передбачення ризиків хвороб</h3>
                {diseaseResults && diseaseResults.length > 0 ? (
                  <>
                    <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
                      Ризики для обраної статі дитини ({diseaseResults[0]?.gender || 'обрана стать'}):
                    </p>
                    <Table
                      dataSource={diseaseResults.map((disease, index) => ({
                        key: disease.key || index,
                        name: disease.name,
                        risk: `${disease.risk}%`,
                      }))}
                      columns={[
                        {
                          title: 'Хвороба',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Ризик',
                          dataIndex: 'risk',
                          key: 'risk',
                          render: (value) => (
                            <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
                              {value}
                            </span>
                          ),
                        },
                      ]}
                      pagination={false}
                      style={{ marginTop: '12px' }}
                    />
                  </>
                ) : (
                  <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                    <p style={{ margin: 0, color: '#52c41a' }}>
                      ✓ Не виявлено підвищених ризиків передачі спадкових хвороб від обраних батьків для обраної статі дитини.
                    </p>
                  </div>
                )}
              </div>
            )}

            <p style={{ marginTop: '12px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
              <em>Примітка:</em> це інформаційний калькулятор і не замінює медичну консультацію.
            </p>
          </Form>
          )}
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
