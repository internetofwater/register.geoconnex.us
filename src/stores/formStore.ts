import { defineStore } from "pinia";


export const useFormStore = defineStore("formStore", {
    
    state: () => ({
        csv: null as File | null,

        readme: null as File | null,

        namespace : '' as string,

        // Remove the next/previous buttons 
        // if the form is an invalid state
        blockNext : false,

    }),
})