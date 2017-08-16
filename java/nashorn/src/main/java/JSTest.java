package com.semicomplete;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptException;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;

public class JSTest {
    public static final String[] FLAGS = { "--no-java", "-strict" };

    public interface Console {
        void log(String arg);
    }

    public static void main(String[] args) throws FileNotFoundException, ScriptException {
        Console console = (arg) -> System.out.println(arg);

        NashornScriptEngineFactory ef = new NashornScriptEngineFactory();
        ScriptEngine engine = ef.getScriptEngine(FLAGS);
        Bindings bindings = engine.createBindings();

        String greeting = "Hello, world!";
        bindings.put("greeting", greeting);
        bindings.put("console", console);

        Reader script = new FileReader(args[0]);
        engine.eval(script, bindings);
    }
}
