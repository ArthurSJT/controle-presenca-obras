import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Configurações do Firebase (substitua pelas suas)
const firebaseConfig = {
  apiKey: "AIzaSyAfDaFHbpG7IFH3tjSBjgyL_hQ9n2SBsqk",
  authDomain: "presen-f5b30.firebaseapp.com",
  projectId:"presen-f5b30" ,
  storageBucket: "presen-f5b30.firebasestorage.app",
  messagingSenderId:"21680174187" ,
  appId:"1:21680174187:web:d456124ae2719974bdad2e" ,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const funcionarios = ["João da Silva", "Maria Santos", "Carlos Pereira"];
const obras = ["Obra A", "Obra B", "Obra C"];

export default function PresencaApp() {
  const [data, setData] = useState("");
  const [obra, setObra] = useState("");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState("");
  const [presencas, setPresencas] = useState([]);

  useEffect(() => {
    carregarPresencas();
  }, []);

  async function carregarPresencas() {
    const snapshot = await getDocs(collection(db, "presencas"));
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPresencas(lista);
  }

  async function marcarPresenca() {
    if (!data || !obra || !funcionarioSelecionado) return;
    await addDoc(collection(db, "presencas"), {
      data,
      obra,
      funcionario: funcionarioSelecionado,
    });
    setFuncionarioSelecionado("");
    carregarPresencas();
  }

  function diasTrabalhados(nome) {
    const inicio = novaQuinzena();
    return presencas.filter(p => p.funcionario === nome && new Date(p.data) >= inicio).length;
  }

  function novaQuinzena() {
    const hoje = new Date();
    const dia = hoje.getDate();
    return new Date(hoje.getFullYear(), hoje.getMonth(), dia < 16 ? 1 : 16);
  }

  async function resetarQuinzena() {
    const inicio = novaQuinzena();
    const snapshot = await getDocs(collection(db, "presencas"));
    const antigos = snapshot.docs.filter(doc => new Date(doc.data().data) < inicio);
    for (const docSnap of antigos) {
      await deleteDoc(doc(db, "presencas", docSnap.id));
    }
    carregarPresencas();
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">Registro de Presença</h2>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <Select value={obra} onValueChange={setObra}>
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
            <SelectTrigger><SelectValue placeholder="Selecione o funcionário" /></SelectTrigger>
            <SelectContent>
              {funcionarios.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={marcarPresenca}>Marcar Presença</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Resumo Quinzenal</h2>
            <Button variant="destructive" onClick={resetarQuinzena}>Resetar Quinzena</Button>
          </div>
          <table className="w-full border mt-2">
            <thead>
              <tr>
                <th className="text-left border p-2">Funcionário</th>
                <th className="text-left border p-2">Dias Trabalhados</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map(f => (
                <tr key={f}>
                  <td className="border p-2">{f}</td>
                  <td className="border p-2">{diasTrabalhados(f)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
