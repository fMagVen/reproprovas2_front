import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
  searchOptions
} from "../services/api";

function Disciplines() {

  const navigate = useNavigate();
  const { token } = useAuth();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const[searchbarResults, setSearchbarResults] = useState<searchOptions[]>([])

  function formatTests(tests: TestByDiscipline[]){
    const resultsArr: searchOptions[] = []
    tests.forEach(term=>{
      term.disciplines.forEach(discipline => {
        let str: string = `${discipline.name} - `
        discipline.teacherDisciplines[0].tests.forEach(test=>{
          let str2: string = str + `${test.category.name} - ${test.name} - (${discipline.teacherDisciplines[0].teacher.name})`
          resultsArr.push({label: str2, id: test.id})
        })
      })
    })
    setTerms(tests)
    setSearchbarResults(resultsArr)
  }

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      formatTests(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);

  async function getTest(e: any, v: any){
    const { data: singleTest } = await api.getTest(token as string, v.id);
    window.location.href = `${singleTest.pdfUrl}`
  }

  return (
    <>
      <Autocomplete
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        options={searchbarResults}
        onChange={getTest}
        renderInput={params => (
          <TextField
          label="Pesquise por disciplina"
          {...params}
          />
        )}
      />
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
            variant="contained"
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
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
}

function TermsAccordions({ categories, terms }: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Per??odo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
}

function DisciplinesAccordions({
  categories,
  disciplines,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse per??odo...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => (
        <Accordion
          sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
          key={discipline.id}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{discipline.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Categories
              categories={categories}
              teachersDisciplines={discipline.teacherDisciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
}

function Categories({ categories, teachersDisciplines }: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines teachersDisciplines={teachersDisciplines} />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

function TeachersDisciplines({ teachersDisciplines }: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return <Tests testsWithTeachers={testsWithDisciplines} />;
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
}

function Tests({ testsWithTeachers: testsWithDisciplines }: TestsProps) {
  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests.map((test) => (
          <Typography key={test.id} color="#878787">
            <Link
              href={test.pdfUrl}
              target="_blank"
              underline="none"
              color="inherit"
            >{`${test.name} (${testsWithDisciplines.teacherName})`}</Link>
          </Typography>
        ))
      )}
    </>
  );
}

export default Disciplines;
