"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";

type ResultProps = {
  disease: string;
  cause: string;
  precautions: string[];
};

export default function CropPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ResultProps | null>(null);
  const [disease, setDisease] = useState("");
  const [cause, setCause] = useState("");
  const [precautions, setPrecautions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (reader.result as string).split(",")[1];
        setImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  async function generate(images: string[]) {
    try {
      const prompt: string = `You are the best in class crop disease detector equipped with cutting-edge technology to identify and diagnose even the most elusive crop diseases with precision and speed. Detect the disease in the crop image below and provide details on the disease, its cause, and precautions to take to prevent it.

      KEY POINTS:
      - Return in JSON format only. without any "json" written at the first

      Return the result as a JSON format only with the following structure:
        {
          "disease": "The disease detected in the crop.",
          "cause": "The cause of the disease.",
          "precautions": "The precautions to take to prevent the disease." (in an array of strings)
        }
        If no disease is detected, return 
        {
          "disease": "No crop disease detected.",
          "cause": "N/A",
          "precautions": "["N/A"]"
        }
      `;

      const response = await api.generate(prompt, images);
      // ```json
      // {
      //   "disease": "No crop disease detected.",
      //   "cause": "N/A",
      //   "precautions": ["N/A"]
      // }
      // ```
      // Give me only the json part
      console.log(response);
      return JSON.parse(response);
    } catch (error) {
      toast.error("Failed to detect crop disease.");
    }
  }

  const handleDetect = () => {
    setIsLoading(true);
    if (image) {
      generate([image])
        .then((result) => {
          setResult(result);
          console.log(result.disease);
          console.log(result.cause);
          console.log(result.precautions);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
  };

  console.log(disease, cause, precautions);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Crop Disease Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Crop Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          {image && (
            <div className="aspect-video relative">
              <Image
                src={`data:image/png;base64,${image}`}
                alt="Uploaded crop"
                className="object-cover w-full h-full rounded-md"
                width={640}
                height={360}
              />
            </div>
          )}
          <Button
            className="w-full"
            onClick={handleDetect}
            disabled={!image || isLoading}
          >
            {isLoading ? "Detecting..." : "Detect"}
          </Button>
          {result &&
            !isLoading &&
            result.disease !== "No crop disease detected." && (
              <Card>
                <CardHeader>
                  <CardTitle>Detection Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Disease:</strong> {result?.disease}
                  </p>
                  <p>
                    <strong>Cause:</strong> {result?.cause}
                  </p>
                  <div>
                    <strong>Precautions:</strong>
                    <ul className="list-disc pl-5">
                      {Array.isArray(result.precautions) ? (
                        result?.precautions.map((precaution, index) => (
                          <li key={index}>{precaution}</li>
                        ))
                      ) : (
                        <li>No precautions available</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          {result &&
            !isLoading &&
            result.disease === "No crop disease detected." && (
              <Card>
                <CardHeader>
                  <CardTitle>Detection Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No crop disease detected.</p>
                </CardContent>
              </Card>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
