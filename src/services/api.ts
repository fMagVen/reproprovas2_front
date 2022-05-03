import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface TeachersFromDiscipline {
  id: number;
  teacherId: number;
  disciplineId: number;
  teacher: Teacher;
}

export interface Category {
  id: number;
  name: string;
}

export interface DisciplineList {
  id: number,
  name: string,
  termId: number
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
}

export interface searchOptions{
  label: string,
  id: number
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

async function getTestsByDiscipline(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    "/tests?groupBy=disciplines",
    config
  );
}

async function getTestsByTeacher(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    "/tests?groupBy=teachers",
    config
  );
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

async function getDisciplines(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ disciplines: DisciplineList[] }>("/disciplines", config);
}

async function getTeachersById(token: string, id: number) {
  const config = getConfig(token);
  return baseAPI.get<{ teachers: TeachersFromDiscipline[] }>(`/teachers/${id}`, config)
}

async function addTest(token: string, form: any){
  const config = getConfig(token);
  return baseAPI.post("/tests", form, config)
}

async function getTest(token: string, id: number){
  const config = getConfig(token);
  return baseAPI.get(`/tests/${id}`, config)
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getDisciplines,
  getTeachersById,
  addTest,
  getTest
};

export default api;
