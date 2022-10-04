import { IVacancy } from "@/api/models/IVacancy";
import {VacaniesService} from "@/api/services/VacanciesService";
import ToGetStart from "@/components/utils/ToGetStart";
import SkeletonVacanciesList from "@/components/VacanciesList/SkeletonVacanciesList";
import VacanciesList from "@/components/VacanciesList/VacanciesList";
import VacancyInfo from "@/components/VacanciesList/VacancyInfo";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { vacanciesSlice } from "@/store/reducers/vacanciesSlice";
import { GetServerSideProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import Layout from "@/layouts/MainLayout";
import { navSlice } from "@/store/reducers/navSlice";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  return {
    props: {
      id: id,
    },
  };
};

type vacancy = {
  id: string;
};

const VacancySelected:NextPage<vacancy> = (SerchVacancy: vacancy) => {
  const dispatch = useAppDispatch();

  const { skill, lvl } = useAppSelector((state) => state.navReducer);
  const { setActive } = navSlice.actions;

  const { vacancies } = useAppSelector((state) => state.vacancyReducer);
  const { setVacancies } = vacanciesSlice.actions;

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(false);
  const [filterVacancies, setFliterVacancies] = useState<IVacancy[]>([]);

  const filterList = (list: IVacancy[]) => {
    if (skill !== "") {
      list = list.filter(
        (i) => i.mainTechnology === skill || i.techStack.includes(skill)
      );
    }
    if (lvl !== "All") {
      list = list.filter((i) => i.experienceLevel === lvl);
    }
    setLoading(false);
    return list;
  };

  useEffect(() => {
    if (SerchVacancy.id !== "serch") {
      dispatch(setActive(true));
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [SerchVacancy.id]);

  useEffect(() => {
    if (vacancies.length === 0) {
      VacaniesService.getVacancies().then((res) => {
        dispatch(setVacancies(res.data));
        setFliterVacancies(filterList(res.data));
      });
    } else {
      setFliterVacancies(filterList(vacancies));
    }
  }, [lvl, skill]);

  
  return (
    <Layout col={2} full={true} title={skill === "" ? "Serch" : skill}>
      {loading ? <SkeletonVacanciesList /> : <VacanciesList vacancies={filterVacancies} />}
      {selected ? <VacancyInfo id={SerchVacancy.id} /> : <ToGetStart />}
    </Layout>
  );
};

export default VacancySelected