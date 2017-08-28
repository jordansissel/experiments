package com.semicomplete;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptException;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Reader;
import java.util.Collections;
import java.util.Map;

public class JSTest {
    public static final String[] FLAGS = { "--no-java", "-strict" };

    public interface Console {
        void log(String arg);
    }

    public interface Bork {
        public void bork() throws UnsupportedOperationException;
    }

    public static void main(String[] args) throws FileNotFoundException, ScriptException {
        Console console = (arg) -> System.out.println(arg);

        NashornScriptEngineFactory ef = new NashornScriptEngineFactory();
        ScriptEngine engine = ef.getScriptEngine(FLAGS);
        Bindings bindings = engine.createBindings();

        bindings.put("$ARG", Collections.EMPTY_LIST);
        bindings.put("$ENV", Collections.EMPTY_MAP);
        bindings.put("$OPTIONS", "");
        bindings.put("$OUT", null);
        bindings.put("$ERR", null);
        bindings.put("$EXIT", 0);
        bindings.put("quit", (Bork)JSTest::unsupported);
        bindings.put("exit", (Bork)JSTest::unsupported);
        bindings.put("print", (Bork)JSTest::unsupported);
        bindings.put("echo", (Bork)JSTest::unsupported);
        bindings.put("readLine", (Bork)JSTest::unsupported);
        bindings.put("load", (Bork)JSTest::unsupported);
        bindings.put("loadWithNewGlobal", (Bork)JSTest::unsupported);
        bindings.put("$EXEC", (Bork)JSTest::unsupported);

        String greeting = "Hello";
        bindings.put("greeting", greeting);
        bindings.put("console", console);

        Reader script = new FileReader(args[0]);
        engine.eval(script, bindings);
    }

    public static void unsupported() throws UnsupportedOperationException {
        throw new UnsupportedOperationException("this function is unsupported");
    }
}

