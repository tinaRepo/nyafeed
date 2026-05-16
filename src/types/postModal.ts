import { Cat } from "./cat";

// PostModal の Props
type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (cat: Cat, toastMsg: string) => void;
};