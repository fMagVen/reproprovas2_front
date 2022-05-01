import {TextField,
		Divider,
		Box,
		Button,
    Autocomplete,
		Typography
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import useAlert from '../hooks/useAlert'
import api from "../services/api"
import { Category, DisciplineList, TeachersFromDiscipline } from '../services/api'
import Form from '../components/Form'

  export interface FormData {
    name: string,
    pdfUrl: string,
    categoryId: number,
    teacherDisciplineId: number
  }

  interface FormatedForInput {
    label: string,
    categoryId?: number,
    disciplineId?: number,
    teacherDisciplineId?: number
  }

  const styles = {
    title: { marginX: "auto", marginBottom: "25px", fontFamily:"Poppins", fontSize:'24px', fontWeight: "500" },
    input: { marginBottom: "30px", width: "100%", fontFamily: "Poppins", fontSize: "16px", fontWeight: "500" },
    button: {width: "100%"}
  }

function AddTest() {
	const navigate = useNavigate()
  const { setMessage } = useAlert()
  const { token } = useAuth();
	const [formData, setFormData] = useState<FormData>({
		name: "",
		pdfUrl: "",
		categoryId: 0,
	  teacherDisciplineId: 0
	});
  const [categories, setCategories]= useState<FormatedForInput[]>([])
  const [disciplines, setDisciplines] = useState<FormatedForInput[]>([])
  const [teachers, setTeachers] = useState<FormatedForInput[]>([])

  useEffect(()=>{
    async function loadPage(){
      if (!token) return;

      const { data: categoriesData } = await api.getCategories(token);
      const { data: disciplinesData } = await api.getDisciplines(token);
      setInputOptions(categoriesData.categories, disciplinesData.disciplines)
    }
    loadPage()
  },[token])
  
  function setInputOptions(categories: Category[], disciplines: DisciplineList[]){
    const formatedCategories: FormatedForInput[] = []
    categories.forEach(category=>{
      formatedCategories.push({label: category.name, categoryId: category.id})
    })
    const formatedDisciplines: FormatedForInput[] = []
    disciplines.forEach(discipline=>{
      formatedDisciplines.push({label: discipline.name, disciplineId: discipline.id})
    })
    setCategories(formatedCategories);
    setDisciplines(formatedDisciplines);
  }

  function setTeachersOptions(teachers: TeachersFromDiscipline[]){
    const formatedTeachers: FormatedForInput[] = []
    teachers.forEach(obj=>{
      formatedTeachers.push({label: obj.teacher.name, teacherDisciplineId: obj.id})
    })
    setTeachers(formatedTeachers)
  }

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	}

  function handleSelectorChange(e: any, v: any){
    v.categoryId && setFormData({...formData, categoryId: v.categoryId})
    v.teacherDisciplineId && setFormData({...formData, teacherDisciplineId: v.teacherDisciplineId})
  }

  async function callTeachers(e:any, v: any){
    const {data: teachersData} = await api.getTeachersById(token as string, v.disciplineId)
    setTeachersOptions(teachersData.teachers)
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()

    if (!formData?.name || !formData?.pdfUrl || !formData?.categoryId || !formData?.teacherDisciplineId) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
      return;
    }

    try{
      await api.addTest(token as string, formData)
      setMessage({ type: "success", text: "Prova adicionada com sucesso!" });
    }catch(e: any){
      if (e.response) {
        setMessage({
          type: "error",
          text: e.response.data,
        });
        return;
      }
      else {
        setMessage({
          type: "error",
          text: "Erro, tente novamente em alguns segundos!",
        });
      }
    }
  }
	  
	return(
		<Form onSubmit={handleSubmit}>
      <Typography sx={styles.title} variant="h4" component="h1">
        Adicione uma prova
      </Typography>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "8px",
            marginTop: "16px",
            marginBottom: "26px"
          }}
        >
          <TextField
            name="name"
            sx={styles.input}
            label="Titulo da prova"
            type="text"
            variant="outlined"
            onChange={handleInputChange}
            value={formData.name}
          />
          <TextField
            name="pdfUrl"
            sx={styles.input}
            label="Pdf da prova"
            type="text"
            variant="outlined"
            onChange={handleInputChange}
            value={formData.pdfUrl}
          />
          <Autocomplete
            aria-label='categoryId'
            sx={styles.input}
            options={categories}
            onChange={handleSelectorChange}
            renderInput={params => (
              <TextField
                label="Categoria"
                {...params}
              />
            )}
          />
          <Autocomplete
            sx={styles.input}
            options={disciplines}
            onChange={callTeachers}
            renderInput={params => (
              <TextField
                label="Disciplina"
                {...params}
              />
            )}
          />
          <Autocomplete
            sx={styles.input}
            options={teachers}
            onChange={handleSelectorChange}
            renderInput={params => (
              <TextField
                label="Professor"
                {...params}
              />
            )}
          />
          <Button sx={styles.button} variant="contained" type="submit">
            ENVIAR
          </Button>
        </Box>
      </Box>
	  </Form>
	)
}

export default AddTest