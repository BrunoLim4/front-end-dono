// frontend-dono/src/components/Dashboard.jsx

import React, { useEffect, useState, useMemo } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaAngleDown,
  FaFilter,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaUpload,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../context/authContext';
import racingLogo from '/img/racing_logo.png';


// CORREÇÃO: Unificação da URL base da API
// Esta variável agora usa VITE_BACKEND_URL (da Vercel) ou o localhost do seu backend (ex: 3001)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Setas customizadas para o carrossel principal (horizontal)
function MainNextArrow({ onClick }) {
  return (
    <div className="slick-next main-carousel-arrow" onClick={onClick}>
      <FaChevronRight size={20} />
    </div>
  );
}

function MainPrevArrow({ onClick }) {
  return (
    <div className="slick-prev main-carousel-arrow" onClick={onClick}>
      <FaChevronLeft size={20} />
    </div>
  );
}

const Dashboard = () => {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState(null);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const availableCategories = ['Feminina', 'Sub06', 'Sub08', 'Sub10', 'Sub14', 'Fora de Categoria'];
  const paymentStatuses = ['Pago', 'Pendente'];

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      // CORREÇÃO: URL completa para a rota de categorias do dono no backend
      const response = await fetch(`${API_BASE_URL}/api/donos/categorias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert('Sessão expirada ou não autorizado. Faça login novamente.');
        logout();
        navigate('/login');
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
        fetchCategories();
    } else {
        navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
  };

  const toggleEditSection = (student) => {
    if (expandedStudentId === student.id) {
      setExpandedStudentId(null);
      setEditStudentData(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
    } else {
      setExpandedStudentId(student.id);
      setEditStudentData({
        ...student,
        // CORREÇÃO AQUI: Garante que 'nomeCompleto' seja preenchido com 'student.name'
        nomeCompleto: student.name || '',
        dataNascimento: student.dataNascimento ? student.dataNascimento.split('T')[0] : '',
      });
      setEditPhotoPreview(student.foto);
    }
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPhotoFile(file);
      setEditPhotoPreview(URL.createObjectURL(file));
    } else {
      setEditPhotoFile(null);
      setEditPhotoPreview(editStudentData.foto);
    }
  };

  const handleEditStudent = async () => {
    if (!editStudentData) return;

    const studentId = editStudentData.id;
    const dataToSend = new FormData();

    dataToSend.append('nomeCompleto', editStudentData.nomeCompleto || '');
    dataToSend.append('dataNascimento', editStudentData.dataNascimento || '');
    dataToSend.append('genero', editStudentData.genero || '');
    dataToSend.append('nomeResponsavel', editStudentData.nomeResponsavel || '');
    dataToSend.append('cpfResponsavel', editStudentData.cpfResponsavel || '');
    dataToSend.append('nomeMae', editStudentData.nomeMae || '');
    dataToSend.append('contato1', editStudentData.contato1 || '');
    dataToSend.append('contato2', editStudentData.contato2 || '');
    dataToSend.append('categoria', editStudentData.categoria || '');
    dataToSend.append('statusPagamento', editStudentData.statusPagamento || 'Pendente');

    if (editPhotoFile) {
      dataToSend.append('foto', editPhotoFile);
    }

    try {
      if (!token) {
        navigate('/login');
        return;
      }

      // CORREÇÃO: URL completa para a rota de atualização de alunos do dono
      const response = await fetch(`${API_BASE_URL}/api/donos/alunos/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: dataToSend,
      });

      if (response.status === 401) {
        alert('Sessão expirada ou não autorizado. Faça login novamente.');
        logout();
        navigate('/login');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao editar aluno.');
      }

      fetchCategories();
      setExpandedStudentId(null);
      setEditStudentData(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
    } catch (err) {
      console.error('Erro ao editar aluno:', err);
      alert(`Erro ao editar: ${err.message}`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) {
      return;
    }
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      // CORREÇÃO: URL completa para a rota de exclusão de alunos do dono
      const response = await fetch(`${API_BASE_URL}/api/donos/alunos/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert('Sessão expirada ou não autorizado. Faça login novamente.');
        logout();
        navigate('/login');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir aluno.');
      }

      fetchCategories();
      setExpandedStudentId(null);
      setEditStudentData(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => {
        const matchesCategory = selectedCategory
          ? category.name === selectedCategory
          : true;
        return matchesCategory;
      })
      .map((category) => {
        const filteredStudents = category.students.filter((student) => {
          const matchesSearchTerm = student.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

          const matchesPaymentStatus = selectedPaymentStatus
            ? (selectedPaymentStatus === 'Pago' && student.paid) ||
              (selectedPaymentStatus === 'Pendente' && !student.paid)
            : true;

          return matchesSearchTerm && matchesPaymentStatus;
        });

        return {
          ...category,
          students: filteredStudents,
        };
      })
      .filter((category) => category.students.length > 0);
  }, [categories, searchTerm, selectedCategory, selectedPaymentStatus]);


  const mainCarouselSettings = {
    dots: true,
    infinite: false,
    autoplay: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '60px',
    arrows: true,
    nextArrow: <MainNextArrow />,
    prevArrow: <MainPrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, centerPadding: '40px' } },
      { breakpoint: 768, settings: { slidesToShow: 1, centerPadding: '30px' } },
      { breakpoint: 480, settings: { slidesToShow: 1, centerPadding: '20px' } },
    ],
  };

  if (loading) {
    return <div className="loading-state">Carregando dados dos alunos...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        Erro ao carregar dados: {error.message}
      </div>
    );
  }

  return (
    <div className="global-style">
      <div className="container">

        <div className="header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Pesquise o aluno ou a categoria aqui"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch />
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>

        {/* Filtros */}
        <div className="filters">
          <div className="dropdown-container">
            <button
              className="filter-button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              Categoria {selectedCategory && `| ${selectedCategory}`} <FaAngleDown />
            </button>
            {showCategoryDropdown && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCategory('');
                    setShowCategoryDropdown(false);
                  }}
                >
                  Todas
                </div>
                {availableCategories.map((cat) => (
                  <div
                    key={cat}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <button
              className="filter-button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              Filtro {selectedPaymentStatus && `| ${selectedPaymentStatus}`} <FaFilter />
            </button>
            {showFilterDropdown && (
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedPaymentStatus('');
                    setShowFilterDropdown(false);
                  }}
                >
                  Todos
                </div>
                {paymentStatuses.map((status) => (
                  <div
                    key={status}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedPaymentStatus(status);
                      setShowFilterDropdown(false);
                    }}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carrossel Principal */}
        <div className="main-content">
          {filteredCategories.length > 0 ? (
            <div className="carousel-wrapper">
              <Slider {...mainCarouselSettings}>
                {filteredCategories.map((category) => (
                  <div className="carousel-category-slide" key={category.name}>
                    <div className="category-column">
                      <h3 className="category-header">{category.name}</h3>
                      <div className="student-list">
                        {category.students && category.students.length > 0 ? (
                          category.students.map((student) => (
                            <div className="student-item-wrapper" key={student.id}>
                              <div
                                className="student-item"
                                onClick={() => toggleEditSection(student)}
                              >
                                <img
                                  src={student.foto || 'https://via.placeholder.com/30'}
                                  alt={student.name}
                                  className="student-photo"
                                />
                                <span>{student.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {student.paid ? (
                                    <FaCheck style={{ color: 'green' }} />
                                  ) : (
                                    <FaTimes style={{ color: 'red', fontSize: '0.8em' }} />
                                  )}
                                  <FaEdit style={{ color: '#555' }} />
                                </div>
                              </div>

                              {/* Dados de edição (expandidos) */}
                              {expandedStudentId === student.id && editStudentData && (
                                <div className="edit-section">
                                  <div className="edit-fields-scroll-container">
                                    <label htmlFor={`nomeCompleto-${student.id}`}>Nome Completo:</label>
                                    <input
                                      type="text"
                                      id={`nomeCompleto-${student.id}`}
                                      name="nomeCompleto"
                                      value={editStudentData.nomeCompleto || ''}
                                      onChange={handleEditFieldChange}
                                    />

                                    <label htmlFor={`dataNascimento-${student.id}`}>Data de Nascimento:</label>
                                    <input
                                      type="date"
                                      id={`dataNascimento-${student.id}`}
                                      name="dataNascimento"
                                      value={editStudentData.dataNascimento || ''}
                                      onChange={handleEditFieldChange}
                                    />

                                    <label htmlFor={`genero-${student.id}`}>Gênero:</label>
                                    <select
                                      id={`genero-${student.id}`}
                                      name="genero"
                                      value={editStudentData.genero || ''}
                                      onChange={handleEditFieldChange}
                                    >
                                      <option value="">Selecione</option>
                                      <option value="Masculino">Masculino</option>
                                      <option value="Feminino">Feminino</option>
                                      <option value="Outro">Outro</option>
                                    </select>


                                    <label htmlFor={`nomeResponsavel-${student.id}`}>Nome do Responsável:</label>
                                    <input
                                      type="text"
                                      id={`nomeResponsavel-${student.id}`}
                                      name="nomeResponsavel"
                                      value={editStudentData.nomeResponsavel || ''}
                                      onChange={handleEditFieldChange}
                                    />

                                    <label htmlFor={`cpfResponsavel-${student.id}`}>CPF do Responsável:</label>
                                    <input
                                      type="text"
                                      id={`cpfResponsavel-${student.id}`}
                                      name="cpfResponsavel"
                                      value={editStudentData.cpfResponsavel || ''}
                                      onChange={handleEditFieldChange}
                                    />

                                    <label htmlFor={`contato1-${student.id}`}>Contato 1:</label>
                                    <input
                                      type="tel"
                                      id={`contato1-${student.id}`}
                                      name="contato1"
                                      value={editStudentData.contato1 || ''}
                                      onChange={handleEditFieldChange}
                                    />

                                    <label htmlFor={`contato2-${student.id}`}>Contato 2:</label>
                                    <input
                                      type="tel"
                                      id={`contato2-${student.id}`}
                                      name="contato2"
                                      value={editStudentData.contato2 || ''}
                                      onChange={handleEditFieldChange}
                                    />

                                    <label htmlFor={`categoria-${student.id}`}>Categoria:</label>
                                    <select
                                      id={`categoria-${student.id}`}
                                      name="categoria"
                                      value={editStudentData.categoria || ''}
                                      onChange={handleEditFieldChange}
                                    >
                                      {availableCategories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>

                                    <label htmlFor={`statusPagamento-${student.id}`}>Status Pagamento:</label>
                                    <select
                                      id={`statusPagamento-${student.id}`}
                                      name="statusPagamento"
                                      value={editStudentData.statusPagamento || 'Pendente'}
                                      onChange={handleEditFieldChange}
                                    >
                                      <option value="Pago">Pago</option>
                                      <option value="Pendente">Pendente</option>
                                    </select>

                                    <label htmlFor={`foto-${student.id}`} className="file-upload-label">
                                      <FaUpload /> Mudar Foto
                                    </label>
                                    <input
                                      type="file"
                                      id={`foto-${student.id}`}
                                      name="foto"
                                      accept="image/*"
                                      onChange={handleEditPhotoChange}
                                      hidden
                                    />
                                    {editPhotoPreview && (
                                      <div className="foto-preview-container">
                                        <img src={editPhotoPreview} alt="Pré-visualização da foto" className="foto-preview" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="edit-section-buttons">
                                    <button
                                      className="save-button"
                                      onClick={handleEditStudent}
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      className="delete-button"
                                      onClick={() => handleDeleteStudent(student.id)}
                                    >
                                      <FaTrash /> Excluir
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="no-students-message">
                            Nenhum aluno cadastrado nesta categoria.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="no-data-message">
              Nenhum dado de aluno disponível para os filtros selecionados.
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="footer">
          <img
            src="/img/imagem-rodape.png"
            alt="Logo Rodapé"
            className="footer-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;