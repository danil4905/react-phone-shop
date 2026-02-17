import { Phone } from "@repo/shared";
import PhoneCard from "./PhoneCard";


export default function PhonesList({phonesList}: {phonesList: Phone[]}) {
    return (
        <ul className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
            {phonesList.map(phone => <li key={phone.id}>
                <PhoneCard phone={phone} />
            </li>)}
        </ul>
    )
}